from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List
from app.db import db
from app.utils.security import verify_token
import uuid
import json
import os

router = APIRouter()

# ==========================================
# Pydantic Schemas for Validation
# ==========================================

class AdminNotificationCreate(BaseModel):
    title: str
    message: str
    type: str
    action_url: Optional[str] = None

class CitizenCreate(BaseModel):
    full_name: str
    mobile: str
    email: str
    password: str
    gender: str
    ward: str
    status: str = "Active"
    avatar_url: Optional[str] = None
    aadhaar_number: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None

class CitizenUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    ward: Optional[str] = None
    status: Optional[str] = None
    aadhaar_number: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None

class GramSabhaCreate(BaseModel):
    date_time: datetime
    agenda: str
    location: str

class SabhaSuggestionCreate(BaseModel):
    suggestion_text: str

class ProjectCreate(BaseModel):
    name: str
    category: str
    budget: float
    start_date: datetime
    expected_completion: datetime
    progress: int = 0
    before_image: Optional[str] = None
    after_image: Optional[str] = None
    status: str = "planning"

class WaterScheduleCreate(BaseModel):
    area: str
    timing: str
    status: str = "active"
    notes: Optional[str] = None

class WaterTankCreate(BaseModel):
    location: str
    capacity: float
    condition: str = "Good"

class CertificateApply(BaseModel):
    certificate_type: str  # birth, death, income, residence
    purpose: str
    data: dict  # JSON details (e.g. child_name, date_of_birth for birth; deceased_name, date_of_death for death)

class TaxPay(BaseModel):
    tax_record_id: int
    transaction_id: int

class TaxLevy(BaseModel):
    citizen_id: int
    tax_type: str
    amount: float
    due_date: datetime

class TaxGenerate(BaseModel):
    house_tax_amount: float
    water_tax_amount: float
    due_date: datetime

class AssetCreate(BaseModel):
    name: str
    asset_type: str
    location: str
    condition: str
    image_url: Optional[str] = None

class AttendanceMark(BaseModel):
    employee_id: int
    status: str  # present, absent, leave
    check_in: Optional[str] = None
    check_out: Optional[str] = None

class LeaveRequestCreate(BaseModel):
    employee_id: int
    start_date: datetime
    end_date: datetime
    reason: str

class FeedbackCreate(BaseModel):
    service_name: str
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class SuggestionCreate(BaseModel):
    title: str
    description: str

class AlertCreate(BaseModel):
    title: str
    message: str
    alert_type: str  # flood, heavy_rain, disease, power_cut, other

class RationCreate(BaseModel):
    distribution_date: datetime
    timing_description: str
    items_available: str
    shop_name: Optional[str] = None
    card_type: Optional[str] = None
    ward_area: Optional[str] = None
    special_instructions: Optional[str] = None

class HealthCampCreate(BaseModel):
    camp_name: str
    camp_type: str
    date: datetime
    location: str
    description: str
    timing: Optional[str] = None
    organizing_team: Optional[str] = None
    target_audience: Optional[str] = None
    required_docs: Optional[str] = None

# ==========================================
# 0. GLOBAL ADMIN NOTIFICATIONS
# ==========================================

@router.get("/notifications")
async def get_admin_notifications(current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Fetch latest 20 notifications
    notifications = await db.adminnotification.find_many(
        order={"created_at": "desc"},
        take=20
    )
    unread_count = await db.adminnotification.count(where={"is_read": False})
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@router.put("/notifications/{id}/read")
async def mark_notification_read(id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    notif = await db.adminnotification.update(
        where={"id": id},
        data={"is_read": True}
    )
    return {"message": "Notification marked as read"}

@router.put("/notifications/read-all")
async def mark_all_read(current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.adminnotification.update_many(
        where={"is_read": False},
        data={"is_read": True}
    )
    return {"message": "All notifications marked as read"}

# ==========================================
# 1. GRAM SABHA MANAGEMENT
# ==========================================

@router.get("/gram-sabha")
async def get_gram_sabha_meetings(current_user=Depends(verify_token)):
    meetings = await db.gramsabhameeting.find_many(
        include={"suggestions": {"include": {"citizen": True}}, "attendance": True},
        order={"date_time": "desc"}
    )
    # If empty, seed mock meetings for demonstration
    if not meetings:
        meeting1 = await db.gramsabhameeting.create(
            data={
                "date_time": datetime(2026, 6, 25, 10, 30),
                "agenda": "Road repair discussion, water pipe maintenance in block B, and final sanitation guidelines.",
                "location": "Gram Panchayat Bhawan Ground",
                "notice_published": True
            }
        )
        meeting2 = await db.gramsabhameeting.create(
            data={
                "date_time": datetime(2026, 5, 10, 11, 00),
                "agenda": "Annual budget planning, allocation of MGNREGA cards, and solar light distribution.",
                "location": "Panchayat Hall",
                "status": "completed",
                "notice_published": True,
                "minutes_url": "https://grampanchayat-sarahi.mp.gov.in/minutes/may-2026.pdf"
            }
        )
        meetings = await db.gramsabhameeting.find_many(
            include={"suggestions": {"include": {"citizen": True}}, "attendance": True},
            order={"date_time": "desc"}
        )
    return meetings

@router.post("/gram-sabha")
async def create_gram_sabha(data: GramSabhaCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only Admin can schedule Gram Sabha meetings")
    meeting = await db.gramsabhameeting.create(
        data={
            "date_time": data.date_time,
            "agenda": data.agenda,
            "location": data.location,
            "notice_published": True
        }
    )
    return {"message": "Gram Sabha meeting scheduled successfully", "meeting": meeting}

@router.post("/gram-sabha/{meeting_id}/suggestion")
async def submit_meeting_suggestion(meeting_id: int, data: SabhaSuggestionCreate, current_user=Depends(verify_token)):
    suggestion = await db.sabhasuggestion.create(
        data={
            "meeting_id": meeting_id,
            "citizen_id": current_user["id"],
            "suggestion_text": data.suggestion_text
        }
    )
    
    # Admin Notification
    citizen = await db.user.find_first(where={"id": current_user["id"]})
    cit_name = citizen.full_name if citizen else "Citizen"
    await db.adminnotification.create(
        data={
            "title": "New Suggestion Received",
            "message": f"{cit_name} submitted a new suggestion for meeting {meeting_id}.",
            "type": "suggestion",
            "action_url": f"/admin/gram-sabha/{meeting_id}"
        }
    )
    
    return {"message": "Suggestion submitted successfully", "suggestion": suggestion}

@router.post("/gram-sabha/{meeting_id}/attendance")
async def mark_meeting_attendance(meeting_id: int, citizen_id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Only Admin or Clerk can mark meeting attendance")
    try:
        attendance = await db.sabhaattendance.create(
            data={
                "meeting_id": meeting_id,
                "citizen_id": citizen_id
            }
        )
        return {"message": "Attendance marked successfully", "attendance": attendance}
    except Exception:
        raise HTTPException(status_code=400, detail="Attendance already marked or invalid details")

@router.put("/gram-sabha/{meeting_id}/minutes")
async def upload_meeting_minutes(meeting_id: int, minutes_url: str, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only Admin can publish meeting minutes")
    meeting = await db.gramsabhameeting.update(
        where={"id": meeting_id},
        data={"minutes_url": minutes_url, "status": "completed"}
    )
    return {"message": "Meeting minutes updated and meeting marked completed", "meeting": meeting}

# ==========================================
# 2. VILLAGE DEVELOPMENT WORKS
# ==========================================

@router.get("/projects")
async def get_projects(current_user=Depends(verify_token)):
    projects = await db.developmentproject.find_many(order={"created_at": "desc"})
    if not projects:
        # Seed mock projects
        await db.developmentproject.create(
            data={
                "name": "Main Road Concrete Laying",
                "category": "Road Construction",
                "budget": 450000.0,
                "start_date": datetime(2026, 4, 1),
                "expected_completion": datetime(2026, 7, 30),
                "progress": 70,
                "status": "active"
            }
        )
        await db.developmentproject.create(
            data={
                "name": "Panchayat Bhawan Solar Lighting",
                "category": "Street Light Installation",
                "budget": 120000.0,
                "start_date": datetime(2026, 5, 10),
                "expected_completion": datetime(2026, 6, 15),
                "progress": 100,
                "status": "completed"
            }
        )
        projects = await db.developmentproject.find_many(order={"created_at": "desc"})
    return projects

@router.post("/projects")
async def create_project(data: ProjectCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    project = await db.developmentproject.create(
        data={
            "name": data.name,
            "category": data.category,
            "budget": data.budget,
            "start_date": data.start_date,
            "expected_completion": data.expected_completion,
            "progress": data.progress,
            "before_image": data.before_image,
            "after_image": data.after_image,
            "status": data.status
        }
    )
    return {"message": "Development project registered successfully", "project": project}

@router.put("/projects/{project_id}")
async def update_project(project_id: int, data: ProjectCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    project = await db.developmentproject.update(
        where={"id": project_id},
        data={
            "progress": data.progress,
            "status": data.status,
            "after_image": data.after_image
        }
    )
    return {"message": "Project progress updated", "project": project}

# ==========================================
# 3. WATER SUPPLY MANAGEMENT
# ==========================================

@router.get("/water-supply")
async def get_water_schedules(current_user=Depends(verify_token)):
    schedules = await db.watersupplyschedule.find_many()
    if not schedules:
        await db.watersupplyschedule.create(data={"area": "Ward 01, Ward 02", "timing": "06:00 AM - 07:30 AM", "status": "active"})
        await db.watersupplyschedule.create(data={"area": "Ward 03, Ward 04", "timing": "07:30 AM - 09:00 AM", "status": "active"})
        await db.watersupplyschedule.create(data={"area": "Ward 05", "timing": "05:00 PM - 06:30 PM", "status": "interrupted", "notes": "Pipeline repair near community center"})
        schedules = await db.watersupplyschedule.find_many()
    return schedules

@router.post("/water-supply")
async def create_water_schedule(data: WaterScheduleCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    sched = await db.watersupplyschedule.create(
        data={
            "area": data.area,
            "timing": data.timing,
            "status": data.status,
            "notes": data.notes
        }
    )
    return {"message": "Water schedule created successfully", "schedule": sched}

@router.put("/water-supply/{schedule_id}")
async def update_water_schedule(schedule_id: int, data: WaterScheduleCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    sched = await db.watersupplyschedule.update(
        where={"id": schedule_id},
        data={
            "area": data.area,
            "timing": data.timing,
            "status": data.status,
            "notes": data.notes
        }
    )
    return {"message": "Water schedule updated successfully", "schedule": sched}

@router.delete("/water-supply/{schedule_id}")
async def delete_water_schedule(schedule_id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    await db.watersupplyschedule.delete(where={"id": schedule_id})
    return {"message": "Water schedule deleted successfully"}


@router.get("/water-supply/tanks")
async def get_water_tanks(current_user=Depends(verify_token)):
    tanks = await db.watertank.find_many()
    if not tanks:
        await db.watertank.create(data={"location": "North Corner Ground", "capacity": 15000.0, "condition": "Good"})
        await db.watertank.create(data={"location": "School Campus", "capacity": 10000.0, "condition": "Good"})
        tanks = await db.watertank.find_many()
    return tanks

@router.post("/water-supply/tanks")
async def create_water_tank(data: WaterTankCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    tank = await db.watertank.create(
        data={
            "location": data.location,
            "capacity": data.capacity,
            "condition": data.condition
        }
    )
    return {"message": "Water tank added successfully", "tank": tank}

@router.delete("/water-supply/tanks/{tank_id}")
async def delete_water_tank(tank_id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    await db.watertank.delete(where={"id": tank_id})
    return {"message": "Water tank deleted successfully"}

# ==========================================
# 4. BIRTH & DEATH REGISTRATION & VERIFICATION
# ==========================================

@router.get("/certificates")
async def get_certificates(current_user=Depends(verify_token)):
    if current_user["role"] == "admin":
        return await db.certificate.find_many(include={"citizen": True})
    elif current_user["role"] == "clerk":
        return await db.certificate.find_many(include={"citizen": True})
    else:
        return await db.certificate.find_many(where={"citizen_id": current_user["id"]})

@router.post("/certificates/apply")
async def apply_certificate(data: CertificateApply, current_user=Depends(verify_token)):
    import json
    app_num = f"CERT-2026-{uuid.uuid4().hex[:6].upper()}"
    cert = await db.certificate.create(
        data={
            "application_number": app_num,
            "citizen_id": current_user["id"],
            "certificate_type": data.certificate_type,
            "data": json.dumps(data.data),
            "purpose": data.purpose,
            "status": "pending"
        }
    )
    
    # Generate Admin Notification
    await db.adminnotification.create(
        data={
            "title": "New Certificate Request",
            "message": f"A new {data.certificate_type} certificate request was submitted (App: {app_num}).",
            "type": "certificate",
            "action_url": "/admin/approvals"
        }
    )
    
    return {"message": "Certificate application submitted", "certificate": cert}

@router.put("/certificates/verify/{cert_id}")
async def verify_certificate(cert_id: int, remarks: str, current_user=Depends(verify_token)):
    if current_user["role"] != "clerk":
        raise HTTPException(status_code=403, detail="Only Clerk can verify documents")
    cert = await db.certificate.update(
        where={"id": cert_id},
        data={
            "status": "pending",  # Keep pending, but update processed by clerk
            "processed_by_id": current_user["id"],
            "remarks": f"Clerk Verified: {remarks}",
            "processed_at": datetime.now()
        }
    )
    return {"message": "Application verified and pushed to Admin", "certificate": cert}

@router.put("/certificates/approve/{cert_id}")
async def approve_certificate(cert_id: int, remarks: str, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only Admin can sign and approve certificates")
    
    # Check if certificate exists
    existing = await db.certificate.find_unique(where={"id": cert_id})
    if not existing:
         raise HTTPException(status_code=404, detail="Certificate not found")
         
    cert = await db.certificate.update(
        where={"id": cert_id},
        data={
            "status": "approved",
            "remarks": f"Admin Approved and Signed: {remarks}",
            "processed_at": datetime.now(),
            "certificate_url": f"https://sarahi-panchayat.mp.gov.in/certs/download/{existing.application_number}"
        }
    )
    return {"message": "Certificate approved and signed successfully", "certificate": cert}

@router.put("/certificates/reject/{cert_id}")
async def reject_certificate(cert_id: int, remarks: str, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only Admin can sign and approve certificates")
    
    existing = await db.certificate.find_unique(where={"id": cert_id})
    if not existing:
         raise HTTPException(status_code=404, detail="Certificate not found")
         
    cert = await db.certificate.update(
        where={"id": cert_id},
        data={
            "status": "rejected",
            "remarks": f"Admin Rejected: {remarks}",
            "processed_at": datetime.now()
        }
    )
    return {"message": "Certificate rejected successfully", "certificate": cert}

@router.get("/certificates/verify-pub/{app_num}")
async def verify_certificate_public(app_num: str):
    # This route is public for QR scans!
    cert = await db.certificate.find_unique(
        where={"application_number": app_num},
        include={"citizen": True, "processor": True}
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found in records")
    return {
        "verified": True,
        "application_number": cert.application_number,
        "citizen_name": cert.citizen.full_name,
        "type": cert.certificate_type,
        "issue_date": cert.processed_at,
        "status": cert.status,
        "remarks": cert.remarks
    }

# ==========================================
# 5. TAX MANAGEMENT
# ==========================================

@router.get("/taxes")
async def get_taxes(current_user=Depends(verify_token)):
    if current_user["role"] in ["admin", "clerk"]:
        return await db.taxrecord.find_many(include={"citizen": True})
    else:
        taxes = await db.taxrecord.find_many(where={"citizen_id": current_user["id"]})
        if not taxes:
            # Seed mock taxes for the user
            await db.taxrecord.create(
                data={
                    "citizen_id": current_user["id"],
                    "tax_type": "house",
                    "amount": 450.0,
                    "due_date": datetime(2026, 9, 30),
                    "status": "unpaid"
                }
            )
            await db.taxrecord.create(
                data={
                    "citizen_id": current_user["id"],
                    "tax_type": "water",
                    "amount": 180.0,
                    "due_date": datetime(2026, 9, 30),
                    "status": "unpaid"
                }
            )
            taxes = await db.taxrecord.find_many(where={"citizen_id": current_user["id"]})
        return taxes

@router.post("/taxes/pay")
async def pay_tax(data: TaxPay, current_user=Depends(verify_token)):
    tax = await db.taxrecord.update(
        where={"id": data.tax_record_id},
        data={
            "status": "pending",
            "payment_date": datetime.now(),
            "transaction_id": data.transaction_id
        }
    )
    return {"message": "Payment submitted for verification", "tax": tax}

@router.put("/taxes/{tax_id}/approve")
async def approve_tax_payment(tax_id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    tax = await db.taxrecord.update(
        where={"id": tax_id},
        data={"status": "paid"}
    )
    return {"message": "Payment approved successfully", "tax": tax}

@router.post("/taxes/levy")
async def levy_tax(data: TaxLevy, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    tax = await db.taxrecord.create(
        data={
            "citizen_id": data.citizen_id,
            "tax_type": data.tax_type,
            "amount": data.amount,
            "due_date": data.due_date,
            "status": "unpaid"
        }
    )
    return {"message": "Tax levied successfully", "tax": tax}

@router.post("/taxes/generate")
async def generate_yearly_taxes(data: TaxGenerate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    current_year = datetime.now().year
    config_path = "tax_config.json"
    
    # Check if already generated this year
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            config = json.load(f)
            if config.get("last_generated_year") == current_year:
                raise HTTPException(status_code=400, detail="Yearly taxes already generated for this year.")
    
    citizens = await db.user.find_many(where={"role": "citizen"})
    count = 0
    for citizen in citizens:
        # Generate House and Water tax unconditionally
        await db.taxrecord.create(data={
            "citizen_id": citizen.id, "tax_type": "house", "amount": data.house_tax_amount,
            "due_date": data.due_date, "status": "unpaid"
        })
        await db.taxrecord.create(data={
            "citizen_id": citizen.id, "tax_type": "water", "amount": data.water_tax_amount,
            "due_date": data.due_date, "status": "unpaid"
        })
        count += 2
    
    # Save generation year
    with open(config_path, "w") as f:
        json.dump({"last_generated_year": current_year}, f)
            
    return {"message": f"Generated {count} new tax records successfully"}

@router.get("/taxes/analytics")
async def get_tax_analytics(current_user=Depends(verify_token)):
    paid_house = await db.taxrecord.count(where={"status": "paid", "tax_type": "house"})
    paid_water = await db.taxrecord.count(where={"status": "paid", "tax_type": "water"})
    unpaid_house = await db.taxrecord.count(where={"status": "unpaid", "tax_type": "house"})
    unpaid_water = await db.taxrecord.count(where={"status": "unpaid", "tax_type": "water"})
    
    current_year = datetime.now().year
    has_generated = False
    config_path = "tax_config.json"
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            try:
                config = json.load(f)
                if config.get("last_generated_year") == current_year:
                    has_generated = True
            except:
                pass
    
    return {
        "house_collection_pct": round(paid_house / (paid_house + unpaid_house) * 100) if (paid_house + unpaid_house) > 0 else 0,
        "water_collection_pct": round(paid_water / (paid_water + unpaid_water) * 100) if (paid_water + unpaid_water) > 0 else 0,
        "total_collected": (paid_house * 450.0) + (paid_water * 180.0),
        "total_unpaid": (unpaid_house * 450.0) + (unpaid_water * 180.0),
        "has_generated_yearly": has_generated
    }

# ==========================================
# 6. VILLAGE ASSET MANAGEMENT
# ==========================================

@router.get("/assets")
async def get_assets(current_user=Depends(verify_token)):
    assets = await db.villageasset.find_many()
    return assets

@router.post("/assets")
async def create_asset(data: AssetCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    asset = await db.villageasset.create(
        data={
            "name": data.name,
            "asset_type": data.asset_type,
            "location": data.location,
            "condition": data.condition,
            "image_url": data.image_url
        }
    )
    return {"message": "Village asset added successfully", "asset": asset}

@router.delete("/assets/{id}")
async def delete_asset(id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.villageasset.delete(where={"id": id})
    return {"message": "Asset deleted successfully"}

# ==========================================
# 7. CLERK DASHBOARD
# ==========================================

@router.get("/clerk/dashboard/stats")
async def get_clerk_dashboard_stats(current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_citizens = await db.user.count(where={"role": "citizen"})
    pending_review = await db.certificate.count(where={"status": "pending"})
    
    # Processed could mean approved certificates
    processed = await db.certificate.count(where={"status": "approved"})
    
    # Grievances
    grievances = await db.complaint.count(where={"status": "open"})
    
    # Action Required List (Mix of pending certs and open complaints)
    # Since we can't easily union two distinct models, we fetch recent 3 of both and sort in python
    pending_certs = await db.certificate.find_many(
        where={"status": "pending"},
        include={"citizen": True},
        order={"submitted_at": "desc"},
        take=3
    )
    
    open_comps = await db.complaint.find_many(
        where={"status": "open"},
        include={"citizen": True},
        order={"submitted_at": "desc"},
        take=3
    )
    
    action_required = []
    for cert in pending_certs:
        citizen_name = cert.citizen.full_name if cert.citizen else "Citizen"
        action_required.append({
            "name": citizen_name,
            "type": f"{cert.certificate_type.capitalize()} Cert.",
            "urgency": "High", # Just a default for certs
            "color": "text-rose-600",
            "date": cert.submitted_at
        })
        
    for comp in open_comps:
        citizen_name = comp.citizen.full_name if comp.citizen else "Citizen"
        action_required.append({
            "name": citizen_name,
            "type": "Complaint Update",
            "urgency": "Med",
            "color": "text-amber-600",
            "date": comp.submitted_at
        })
    
    # Sort by date desc and take top 5
    action_required.sort(key=lambda x: x["date"], reverse=True)
    action_required = action_required[:5]
    
    return {
        "stats": {
            "total_citizens": total_citizens,
            "pending_review": pending_review,
            "processed": processed,
            "grievances": grievances
        },
        "action_required": action_required
    }

# ==========================================
# 7.5 CITIZEN MANAGEMENT (CLERK/ADMIN)
# ==========================================

@router.get("/citizens")
async def get_all_citizens(current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    citizens = await db.user.find_many(
        where={"role": "citizen"},
        include={"profile": True},
        order={"created_at": "desc"}
    )
    
    # Format for frontend
    result = []
    for c in citizens:
        profile = c.profile
        result.append({
            "id": c.id,
            "name": c.full_name,
            "email": c.email,
            "phone": c.mobile,
            "status": "Active" if c.is_active else "Inactive",
            "ward": profile.village if profile and profile.village else "Ward 01",
            "gender": profile.gender.capitalize() if profile and profile.gender else "Unknown",
            "aadhaar": profile.aadhaar_number if profile else "Not Linked",
            "dob": profile.date_of_birth.strftime("%d %b %Y") if profile and profile.date_of_birth else "N/A",
            "address": profile.address if profile and profile.address else "Not updated",
            "avatar": profile.avatar_url if profile and profile.avatar_url else None,
            "created_at": c.created_at.strftime("%d %b %Y") if c.created_at else "Unknown"
        })
    return {"citizens": result}

@router.post("/citizens")
async def create_citizen(data: CitizenCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    existing = await db.user.find_first(where={"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    # Use nested create to ensure atomic transaction
    new_user = await db.user.create(
        data={
            "email": data.email,
            "password_hash": data.password, # For real app, hash this
            "role": "citizen",
            "full_name": data.full_name,
            "mobile": data.mobile,
            "is_active": data.status == "Active",
            "profile": {
                "create": {
                    "gender": data.gender.lower(),
                    "village": data.ward,
                    "aadhaar_number": data.aadhaar_number if data.aadhaar_number else f"PENDING-{uuid.uuid4().hex[:8]}",
                    "avatar_url": data.avatar_url,
                    "address": data.address,
                    "date_of_birth": datetime.strptime(data.dob, "%Y-%m-%d") if data.dob else None
                }
            }
        }
    )
    
    return {"message": "Citizen created successfully", "id": new_user.id}

@router.put("/citizens/{id}")
async def update_citizen(id: int, data: CitizenUpdate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    user = await db.user.find_unique(where={"id": id}, include={"profile": True})
    if not user:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    update_data = {}
    if data.full_name is not None: update_data["full_name"] = data.full_name
    if data.mobile is not None: update_data["mobile"] = data.mobile
    if data.email is not None: update_data["email"] = data.email
    if data.status is not None: update_data["is_active"] = (data.status == "Active")
    
    if update_data:
        await db.user.update(where={"id": id}, data=update_data)
        
    if user.profile:
        profile_data = {}
        if data.gender: profile_data["gender"] = data.gender.lower()
        if data.ward: profile_data["village"] = data.ward
        if data.aadhaar_number: profile_data["aadhaar_number"] = data.aadhaar_number
        if data.address: profile_data["address"] = data.address
        if data.dob: profile_data["date_of_birth"] = datetime.strptime(data.dob, "%Y-%m-%d")
        
        if profile_data:
            await db.citizenprofile.update(
                where={"id": user.profile.id},
                data=profile_data
            )
            
    return {"message": "Citizen updated successfully"}

@router.delete("/citizens/{id}")
async def delete_citizen(id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    # In a real app we might just set is_active=False
    # But for full CRUD we can delete
    # First delete profile if it exists
    user = await db.user.find_unique(where={"id": id}, include={"profile": True})
    if user and user.profile:
        await db.citizenprofile.delete(where={"id": user.profile.id})
        
    await db.user.delete(where={"id": id})
    return {"message": "Citizen deleted successfully"}

# ==========================================
# 8. EMPLOYEE ATTENDANCE SYSTEM
# ==========================================

@router.get("/attendance/staff")
async def get_staff(current_user=Depends(verify_token)):
    staff = await db.employee.find_many(include={"attendance": True, "leave_requests": True})
    return staff

@router.post("/attendance/mark")
async def mark_attendance(data: AttendanceMark, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    start_of_day = datetime.combine(date.today(), datetime.min.time())
    end_of_day = datetime.combine(date.today(), datetime.max.time())
    
    existing = await db.attendance.find_first(
        where={
            "employee_id": data.employee_id,
            "date": {
                "gte": start_of_day,
                "lte": end_of_day
            }
        }
    )
    
    if existing:
        att = await db.attendance.update(
            where={"id": existing.id},
            data={
                "status": data.status,
                "check_in": data.check_in,
                "check_out": data.check_out,
                "date": start_of_day
            }
        )
    else:
        att = await db.attendance.create(
            data={
                "employee_id": data.employee_id,
                "date": start_of_day,
                "status": data.status,
                "check_in": data.check_in,
                "check_out": data.check_out
            }
        )
    return {"message": "Attendance registered", "attendance": att}

@router.post("/attendance/leave")
async def request_leave(data: LeaveRequestCreate, current_user=Depends(verify_token)):
    req = await db.leaverequest.create(
        data={
            "employee_id": data.employee_id,
            "start_date": data.start_date,
            "end_date": data.end_date,
            "reason": data.reason,
            "status": "pending"
        }
    )
    
    # Admin Notification
    employee = await db.employee.find_first(where={"id": data.employee_id})
    emp_name = employee.name if employee else "Staff Member"
    await db.adminnotification.create(
        data={
            "title": "New Leave Request",
            "message": f"{emp_name} requested leave from {data.start_date.date()} to {data.end_date.date()}.",
            "type": "leave",
            "action_url": "/admin/attendance"
        }
    )
    
    return {"message": "Leave request submitted", "request": req}

# ==========================================
# 8. CITIZEN FEEDBACK SYSTEM
# ==========================================

@router.post("/feedback")
async def submit_feedback(data: FeedbackCreate, current_user=Depends(verify_token)):
    f = await db.feedback.create(
        data={
            "citizen_id": current_user["id"],
            "service_name": data.service_name,
            "rating": data.rating,
            "comments": data.comments
        }
    )
    return {"message": "Thank you for your feedback!", "feedback": f}

@router.get("/feedback/analytics")
async def get_feedback_analytics(current_user=Depends(verify_token)):
    feedbacks = await db.feedback.find_many()
    if not feedbacks:
        return {"avg_rating": 4.5, "citizen_satisfaction_score": 90}
    total_rating = sum(f.rating for f in feedbacks)
    avg = round(total_rating / len(feedbacks), 1)
    satisfaction = round((avg / 5) * 100)
    return {"avg_rating": avg, "citizen_satisfaction_score": satisfaction}

# ==========================================
# 9. VILLAGE DIRECTORY
# ==========================================

@router.get("/directory")
async def get_directory(current_user=Depends(verify_token)):
    if current_user["role"] in ["admin", "clerk"]:
        return await db.user.find_many(
            where={"role": "citizen"},
            include={"profile": True, "family": True, "family_head": {"include": {"members": True}}}
        )
    else:
        # Citizens can only see their own profile and family circle
        me = await db.user.find_unique(
            where={"id": current_user["id"]},
            include={"profile": True, "family": {"include": {"members": True}}, "family_head": {"include": {"members": True}}}
        )
        return [me]

# ==========================================
# 10. ONLINE SUGGESTION BOX
# ==========================================

@router.get("/suggestions")
async def get_suggestions(current_user=Depends(verify_token)):
    suggs = await db.usersuggestion.find_many(
        include={"citizen": True, "votes": True},
        order={"submitted_at": "desc"}
    )
    if not suggs:
        # Create mock suggestions
        await db.usersuggestion.create(
            data={
                "citizen_id": current_user["id"],
                "title": "Establish a Public Library",
                "description": "We need a village study room with local books and newspaper support.",
                "status": "under_consideration"
            }
        )
        suggs = await db.usersuggestion.find_many(
            include={"citizen": True, "votes": True},
            order={"submitted_at": "desc"}
        )
    return suggs

@router.post("/suggestions")
async def create_suggestion(data: SuggestionCreate, current_user=Depends(verify_token)):
    sugg = await db.usersuggestion.create(
        data={
            "citizen_id": current_user["id"],
            "title": data.title,
            "description": data.description,
            "status": "pending"
        }
    )
    return {"message": "Idea submitted to suggestion box", "suggestion": sugg}

@router.post("/suggestions/{id}/vote")
async def vote_suggestion(id: int, current_user=Depends(verify_token)):
    try:
        vote = await db.suggestionvote.create(
            data={
                "suggestion_id": id,
                "citizen_id": current_user["id"]
            }
        )
        return {"message": "Suggestion upvoted!", "vote": vote}
    except Exception:
        raise HTTPException(status_code=400, detail="You have already upvoted this suggestion")

class SuggestionStatusUpdate(BaseModel):
    status: str

@router.put("/suggestions/{id}/status")
async def update_suggestion_status(id: int, data: SuggestionStatusUpdate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    valid_statuses = ["pending", "under_consideration", "accepted", "rejected"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    sugg = await db.usersuggestion.update(
        where={"id": id},
        data={"status": data.status}
    )
    return {"message": f"Suggestion marked as {data.status}", "suggestion": sugg}

@router.delete("/suggestions/{id}")
async def delete_suggestion(id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Prisma requires deleting relations first if no cascade
    await db.suggestionvote.delete_many(where={"suggestion_id": id})
    await db.usersuggestion.delete(where={"id": id})
    
    return {"message": "Suggestion deleted successfully"}

# ==========================================
# 11. RATION DISTRIBUTION MANAGEMENT
# ==========================================

@router.get("/ration")
async def get_ration_schedules(current_user=Depends(verify_token)):
    schedules = await db.rationschedule.find_many()
    return schedules

@router.post("/ration")
async def create_ration_schedule(data: RationCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    schedule = await db.rationschedule.create(
        data={
            "distribution_date": data.distribution_date,
            "timing_description": data.timing_description,
            "items_available": data.items_available,
            "shop_name": data.shop_name,
            "card_type": data.card_type,
            "ward_area": data.ward_area,
            "special_instructions": data.special_instructions
        }
    )
    return {"message": "Ration schedule added successfully", "schedule": schedule}

@router.delete("/ration/{id}")
async def delete_ration_schedule(id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.rationschedule.delete(where={"id": id})
    return {"message": "Ration schedule deleted successfully"}

# ==========================================
# 12. AGRICULTURE HELP CENTER
# ==========================================

@router.get("/agriculture")
async def get_agriculture_info(current_user=Depends(verify_token)):
    schemes = await db.agrischeme.find_many()
    advisories = await db.seasonaladvisory.find_many()
    if not schemes:
        await db.agrischeme.create(data={"title": "PM Kisan Kalyan", "description": "Financial support for crop sowing.", "benefit": "₹2000 every quarter"})
        await db.seasonaladvisory.create(data={"crop_name": "Paddy", "advisory_message": "Sowing starts. Keep water levels at 2 inches.", "month": "June"})
        schemes = await db.agrischeme.find_many()
        advisories = await db.seasonaladvisory.find_many()
    return {"schemes": schemes, "advisories": advisories}

# ==========================================
# 13. HEALTH CAMP MANAGEMENT
# ==========================================

@router.get("/health-camps")
async def get_health_camps(current_user=Depends(verify_token)):
    camps = await db.healthcamp.find_many(include={"registrations": True})
    return camps

@router.post("/health-camps")
async def create_health_camp(data: HealthCampCreate, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    camp = await db.healthcamp.create(
        data={
            "camp_name": data.camp_name,
            "camp_type": data.camp_type,
            "date": data.date,
            "location": data.location,
            "description": data.description,
            "timing": data.timing,
            "organizing_team": data.organizing_team,
            "target_audience": data.target_audience,
            "required_docs": data.required_docs
        }
    )
    return {"message": "Health camp added successfully", "camp": camp}

@router.delete("/health-camps/{id}")
async def delete_health_camp(id: int, current_user=Depends(verify_token)):
    if current_user["role"] not in ["admin", "clerk"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.healthcamp.delete(where={"id": id})
    return {"message": "Health camp deleted successfully"}

@router.post("/health-camps/register")
async def register_health_camp(camp_id: int, current_user=Depends(verify_token)):
    try:
        reg = await db.campregistration.create(
            data={
                "camp_id": camp_id,
                "citizen_id": current_user["id"]
            }
        )
        return {"message": "Successfully registered for health camp!", "registration": reg}
    except Exception:
        raise HTTPException(status_code=400, detail="Already registered for this camp")

# ==========================================
# 14. EMERGENCY ALERT SYSTEM
# ==========================================

@router.get("/emergency/alerts")
async def get_alerts():
    alerts = await db.emergencyalert.find_many(where={"active": True})
    return alerts

@router.post("/emergency/alerts")
async def create_alert(data: AlertCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    alert = await db.emergencyalert.create(
        data={
            "title": data.title,
            "message": data.message,
            "alert_type": data.alert_type,
            "active": True
        }
    )
    # simulated SMS / WhatsApp logs
    print(f"[SMS/WHATSAPP ALERT SENT] Broadcasted '{data.title}' to all registered mobile numbers.")
    return {"message": "Emergency alert broadcasted successfully", "alert": alert}

# ==========================================
# 15. DIGITAL MAP LOCATIONS
# ==========================================

@router.get("/map/locations")
async def get_map_locations(current_user=Depends(verify_token)):
    return [
        {"name": "Panchayat Bhawan", "type": "building", "lat": 24.5372, "lng": 81.3031, "details": "Sarahi Main administrative office"},
        {"name": "Govt School", "type": "school", "lat": 24.5385, "lng": 81.3045, "details": "Primary and secondary educational center"},
        {"name": "Water Storage Tank", "type": "water", "lat": 24.5360, "lng": 81.3020, "details": "Capacity: 15k Liters"},
        {"name": "Sanitation Health Center", "type": "health", "lat": 24.5390, "lng": 81.3015, "details": "First-aid and weekly clinics"}
    ]
