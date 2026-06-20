from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from app.utils.security import verify_token

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Count total citizens (users with role = citizen)
    total_citizens = await db.user.count(where={"role": "citizen"})
    
    # Count pending registration requests (approvals needed)
    pending_approvals = await db.registrationrequest.count(where={"status": "pending"})
    
    # Count open complaints (alerts)
    open_complaints = await db.complaint.count(where={"status": "open"})
    
    # Count total certificates
    total_certificates = await db.certificate.count()
    
    # Count resolved complaints for health score
    resolved_complaints = await db.complaint.count(where={"status": "resolved"})
    total_complaints = await db.complaint.count()
    
    # Count active schemes
    active_schemes = await db.scheme.count(where={"is_active": True})
    total_schemes = await db.scheme.count()
    
    # Complaint resolving percentage
    complaint_resolve_pct = round((resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0)
    
    # Scheme utilization percentage (active vs total)
    scheme_util_pct = round((active_schemes / total_schemes * 100) if total_schemes > 0 else 0)
    
    # Recent Activities
    recent_registrations = await db.registrationrequest.find_many(
        order={"submitted_at": "desc"},
        take=4
    )
    
    recent_complaints = await db.complaint.find_many(
        order={"submitted_at": "desc"},
        take=4
    )
    
    return {
        "stats": {
            "total_citizens": total_citizens,
            "pending_approvals": pending_approvals,
            "open_complaints": open_complaints,
            "total_certificates": total_certificates,
        },
        "health": {
            "complaint_resolve_pct": complaint_resolve_pct,
            "scheme_util_pct": scheme_util_pct,
        },
        "recent_registrations": [req.model_dump() for req in recent_registrations],
        "recent_complaints": [comp.model_dump() for comp in recent_complaints]
    }

@router.get("/registration-requests")
async def get_registration_requests(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    requests = await db.registrationrequest.find_many(
        order={"submitted_at": "desc"}
    )
    return {"requests": [req.model_dump() for req in requests]}

@router.post("/registration-requests/{request_id}/approve")
async def approve_registration_request(request_id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    req = await db.registrationrequest.find_unique(where={"id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is already processed")
    
    # Check if email or aadhaar already exists in User
    existing_user = await db.user.find_first(where={"email": req.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create User
    new_user = await db.user.create(
        data={
            "email": req.email,
            "password_hash": req.password_hash,
            "role": "citizen",
            "full_name": req.full_name,
            "mobile": req.mobile,
            "is_active": True
        }
    )
    
    # Create Profile
    await db.citizenprofile.create(
        data={
            "user_id": new_user.id,
            "aadhaar_number": req.aadhaar_number,
            "date_of_birth": req.date_of_birth,
            "gender": req.gender,
            "address": req.address,
            "village": req.village,
            "pincode": req.pincode
        }
    )
    
    import datetime
    await db.registrationrequest.update(
        where={"id": request_id},
        data={
            "status": "approved",
            "reviewed_at": datetime.datetime.utcnow(),
            "reviewed_by_id": current_user.get("id")
        }
    )
    
    return {"message": "Registration request approved successfully", "user_id": new_user.id}

@router.post("/registration-requests/{request_id}/reject")
async def reject_registration_request(request_id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    req = await db.registrationrequest.find_unique(where={"id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is already processed")
    
    import datetime
    await db.registrationrequest.update(
        where={"id": request_id},
        data={
            "status": "rejected",
            "reviewed_at": datetime.datetime.utcnow(),
            "reviewed_by_id": current_user.get("id")
        }
    )
    
    return {"message": "Registration request rejected successfully"}

from pydantic import BaseModel

class ClerkCreate(BaseModel):
    full_name: str
    email: str
    mobile: str
    password: str
    village: str

@router.get("/clerks")
async def get_clerks(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    clerks = await db.user.find_many(
        where={"role": "clerk"},
        include={"employee": True, "processed_certs": True}
    )
    
    result = []
    for clerk in clerks:
        tasks_handled = len(clerk.processed_certs) if clerk.processed_certs else 0
        village = "Panchayat Office"
        
        result.append({
            "id": clerk.id,
            "name": clerk.full_name,
            "email": clerk.email,
            "mobile": clerk.mobile,
            "status": "Active" if clerk.is_active else "Inactive",
            "village": village,
            "tasksHandled": tasks_handled
        })
    return {"clerks": result}

@router.post("/clerks")
async def add_clerk(data: ClerkCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    existing = await db.user.find_first(where={"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = await db.user.create(
        data={
            "full_name": data.full_name,
            "email": data.email,
            "mobile": data.mobile,
            "password_hash": data.password,
            "role": "clerk",
            "is_active": True
        }
    )
    
    await db.employee.create(
        data={
            "name": data.full_name,
            "designation": "clerk",
            "user_id": new_user.id
        }
    )
    
    return {"message": "Clerk added successfully", "clerk_id": new_user.id}

class ComplaintStatusUpdate(BaseModel):
    status: str

@router.get("/complaints")
async def get_admin_complaints(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    complaints = await db.complaint.find_many(
        include={"citizen": True},
        order={"submitted_at": "desc"}
    )
    
    result = []
    for c in complaints:
        status_str = c.status.name if hasattr(c.status, 'name') else str(c.status)
        result.append({
            "id": c.id,
            "ref_id": c.complaint_number,
            "citizen": c.citizen.full_name if c.citizen else "Unknown",
            "category": c.complaint_type,
            "date": c.submitted_at.strftime("%d %b %Y"),
            "status": "In Progress" if status_str == "in_progress" else status_str.capitalize(),
            "urgent": c.priority.lower() == "high",
            "description": c.description
        })
    return {"complaints": result}

@router.put("/complaints/{id}/status")
async def update_complaint_status(id: int, data: ComplaintStatusUpdate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Map status back to enum format if needed, but prisma usually takes string
    status_val = data.status.lower().replace(" ", "_")
    await db.complaint.update(
        where={"id": id},
        data={"status": status_val}
    )
    return {"message": "Status updated"}

# =================== NOTICES ===================

class NoticeCreate(BaseModel):
    title: str
    content: str
    notice_type: str = "update"

@router.get("/notices")
async def get_notices(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    notices = await db.notice.find_many(
        include={"creator": True},
        order={"created_at": "desc"}
    )
    
    result = []
    for n in notices:
        result.append({
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "notice_type": n.notice_type,
            "is_published": n.is_published,
            "created_at": n.created_at.strftime("%d %b %Y"),
            "expiry_date": n.expiry_date.strftime("%d %b %Y") if n.expiry_date else None,
            "created_by": n.creator.full_name if n.creator else "Unknown"
        })
    return {"notices": result}

@router.post("/notices")
async def create_notice(data: NoticeCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    notice = await db.notice.create(
        data={
            "title": data.title,
            "content": data.content,
            "notice_type": data.notice_type,
            "is_published": True,
            "created_by_id": current_user["id"]
        }
    )
    return {"message": "Notice created successfully", "notice_id": notice.id}

@router.delete("/notices/{notice_id}")
async def delete_notice(notice_id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.notice.delete(where={"id": notice_id})
    return {"message": "Notice deleted successfully"}

@router.put("/notices/{notice_id}")
async def edit_notice(notice_id: int, data: NoticeCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.notice.update(
        where={"id": notice_id},
        data={
            "title": data.title,
            "content": data.content,
            "notice_type": data.notice_type
        }
    )
    return {"message": "Notice updated successfully"}

# =================== SCHEMES ===================

class SchemeCreate(BaseModel):
    scheme_name: str
    description: str

@router.get("/schemes")
async def get_schemes(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    schemes = await db.scheme.find_many(
        order={"created_at": "desc"}
    )
    
    result = []
    for s in schemes:
        result.append({
            "id": s.id,
            "name": s.scheme_name,
            "description": s.description,
            "is_active": s.is_active,
            "created_at": s.created_at.strftime("%d %b %Y"),
            "status": "Active" if s.is_active else "Paused"
        })
    return {"schemes": result}

@router.post("/schemes")
async def create_scheme(data: SchemeCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    scheme = await db.scheme.create(
        data={
            "scheme_name": data.scheme_name,
            "description": data.description,
            "is_active": True,
            "created_by_id": current_user["id"]
        }
    )
    return {"message": "Scheme added successfully", "scheme_id": scheme.id}

@router.delete("/schemes/{scheme_id}")
async def delete_scheme(scheme_id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.scheme.delete(where={"id": scheme_id})
    return {"message": "Scheme deleted"}

@router.put("/schemes/{scheme_id}")
async def edit_scheme(scheme_id: int, data: SchemeCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.scheme.update(
        where={"id": scheme_id},
        data={
            "scheme_name": data.scheme_name,
            "description": data.description
        }
    )
    return {"message": "Scheme updated successfully"}

@router.put("/schemes/{scheme_id}/toggle")
async def toggle_scheme(scheme_id: int, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    scheme = await db.scheme.find_unique(where={"id": scheme_id})
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    updated = await db.scheme.update(
        where={"id": scheme_id},
        data={"is_active": not scheme.is_active}
    )
    return {"message": "Scheme status toggled", "is_active": updated.is_active}

# =================== REPORTS ===================

@router.get("/reports/stats")
async def get_report_stats(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_citizens = await db.user.count(where={"role": "citizen"})
    total_complaints = await db.complaint.count()
    resolved_complaints = await db.complaint.count(where={"status": "resolved"})
    total_certificates = await db.certificate.count()
    approved_certificates = await db.certificate.count(where={"status": "approved"})
    total_schemes = await db.scheme.count()
    active_schemes = await db.scheme.count(where={"is_active": True})
    total_notices = await db.notice.count()
    open_complaints = await db.complaint.count(where={"status": "open"})
    
    completion_rate = round((resolved_complaints / total_complaints * 100) if total_complaints > 0 else 0, 1)
    cert_approval_rate = round((approved_certificates / total_certificates * 100) if total_certificates > 0 else 0, 1)
    
    return {
        "total_citizens": total_citizens,
        "total_complaints": total_complaints,
        "resolved_complaints": resolved_complaints,
        "open_complaints": open_complaints,
        "total_certificates": total_certificates,
        "approved_certificates": approved_certificates,
        "total_schemes": total_schemes,
        "active_schemes": active_schemes,
        "total_notices": total_notices,
        "completion_rate": completion_rate,
        "cert_approval_rate": cert_approval_rate,
    }


# =================== GRAM SABHA ===================

from pydantic import BaseModel

class GramSabhaCreate(BaseModel):
    date_time: str
    location: str
    agenda: str

@router.get("/gram-sabha")
async def get_gram_sabha(current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    meetings = await db.gramsabhameeting.find_many(
        include={"suggestions": {"include": {"citizen": True}}},
        order={"date_time": "desc"}
    )
    return meetings

@router.post("/gram-sabha")
async def create_gram_sabha(data: GramSabhaCreate, current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    from datetime import datetime
    try:
        dt = datetime.fromisoformat(data.date_time.replace('Z', '+00:00'))
    except Exception:
        dt = datetime.now()

    new_meeting = await db.gramsabhameeting.create(
        data={
            "date_time": dt,
            "location": data.location,
            "agenda": data.agenda,
            "status": "scheduled"
        }
    )
    return new_meeting

@router.put("/gram-sabha/{meeting_id}/minutes")
async def update_gram_sabha_minutes(meeting_id: int, minutes_url: str = "", current_user=Depends(verify_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    meeting = await db.gramsabhameeting.find_unique(where={"id": meeting_id})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    updated = await db.gramsabhameeting.update(
        where={"id": meeting_id},
        data={
            "status": "completed",
            "minutes_url": minutes_url
        }
    )
    return updated
