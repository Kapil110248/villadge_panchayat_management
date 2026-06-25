const { prisma } = require('../db');
const fs = require('fs');
const path = require('path');

exports.getDirectory = async (req, res) => {
  try {
    if (['admin', 'clerk'].includes(req.user.role)) {
      const users = await prisma.user.findMany({
        where: {
          role: "citizen",
          is_active: true,
          family_member_id: null
        },
        include: {
          profile: true,
          family: true,
          family_head: {
            include: {
              members: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });
      return res.json(users);
    } else {
      const me = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          profile: true,
          family: {
            include: {
              head: {
                include: {
                  profile: true
                }
              },
              members: {
                include: {
                  profile: true
                }
              }
            }
          },
          family_head: {
            include: {
              head: {
                include: {
                  profile: true
                }
              },
              members: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });
      return res.json([me]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: "Internal Server Error" });
  }
};

exports.getPanchayatInfo = async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../panchayat_config.json');
    let config = {
      name: "Ramesh Kumar",
      role: "Panchayat Administrator (Sarpanch)",
      village: "Sarahi",
      tenure: "2023 - 2028",
      email: "ramesh.sarpanch@gram.in",
      phone: "+91 88XXX XXXXX",
      jurisdiction: "Sarahi Block A & B",
      rating: "4.8/5.0",
    };
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ detail: "Internal Server Error" });
  }
};
