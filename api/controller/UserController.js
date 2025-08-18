
const Joi = require('joi');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const { CompanyModel, GeneralSettings } = require('../model/CompanyModel');
const Role = require('../model/Role');
const Permission = require('../model/Permission');
const Module = require('../model/Module');


exports.Register = async (req, res) => {
    try {
        const { error } = await validateUser(req.body);
        if (error) {
            return res.status(400).json({ error: error.details });
        }
        const existUser = await User.findAll({
            where: {
                email: req.body.email,
                status: 1
            },
        });
        if (existUser.length > 0) {
            return res.status(200).json({ status: false, message: "user already exist" });
        }
        const userData = await User.create({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            user_password: req.body.password,
            status: req.body.status,
        });
        const token = await User.generateToken({ id: userData.id, name: userData.name, email: userData.email });
        await User.update({ remember_token: token }, {
            where: {
                id: userData.id
            }
        })
        return res.status(200).json({ status: true, message: "user successful created", token: token, user: userData });
    } catch (error) {
        return res.status(404).json({ message: error });
    }
}
exports.ChangePassword = async (req, res) => {
    try {
        const findUser = await User.findOne({
            where: {
                id: req.user.id,
            },
        });
        if (findUser) {
            const isPassword = await bcrypt.compare(req.body.old_password, findUser.user_password);
            if (!isPassword) {
                return res.status(400).json({
                    message: false,
                    errorMessage: "Password does not match !"
                })
            }
            await User.update({ user_password: await bcrypt.hash(req.body.password, 10) }, {
                where: {
                    id: findUser.id
                }
            })
            return res.status(200).json({ status: true, message: "Password has been changed" });
        } else {
            return res.status(400).json({ status: false, errorMessage: "user does not exist" });
        }
    } catch (error) {
        return res.status(404).json(error);
    }
}


exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists and is active
        const findUser = await User.findOne({
            where: {
                email: email,
                status: 1,

            },
        });

        if (!findUser) {
            return res.status(400).json({ status: false, errorMessage: "User does not exist" });
        }

        // Validate password
        const isPassword = await bcrypt.compare(password, findUser.user_password);
        if (!isPassword) {
            return res.status(400).json({
                message: false,
                errorMessage: "Invalid email and password"
            });
        }

        // Fetch currency and timezone settings
        const fetchSettings = await GeneralSettings.findOne({
            where: {
                company_id: findUser.company_id,
            }
        });

        if (!fetchSettings) {
            return res.status(400).json({ status: false, errorMessage: "Settings not found for the company" });
        }

        // Generate token
        const token = await User.generateToken({
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            company_id: findUser.company_id,
            timezone: fetchSettings.timezone,
            currency_symbol: fetchSettings.symbol,
            currency_name: fetchSettings.currency_name,
            currency_code: fetchSettings.currency_code,
            position: findUser.position,
        });

        // Update user's remember token
        await User.update({ remember_token: token }, {
            where: {
                id: findUser.id
            }
        });

        return res.status(200).json({ status: true, message: "Login successfully", token: token, user: findUser });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: error.message });
    }
};


exports.GetAllUser = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                status: 1,
                company_id: req.user.company_id
            },
        });
        return res.status(200).json({ "message": true, "user": user })
    } catch (err) {
        return res.status(400).json(err)
    }
}

//get total count
// exports.GetAllUserCount = async (req, res) => {

//     try {
//         // Fetch all users with status 1
//         const users = await User.findAll({
//             where: {
//                 status: 1,
//                 company_id: req.user.company_id
//             },
//         });

//         // Calculate the total count of users
//         const totalCount = users.length;

//         // Respond with the users and total count
//         return res.status(200).json({
//             message: true,
//             totalCountuser: totalCount,
//             users: users
//         });
//     } catch (err) {
//         // Handle errors and respond with a 400 status code
//         return res.status(400).json(err);
//     }
// };

exports.GetAllRole = async (req, res) => {
    try {
        const role = await Role.findAll({
            where: {
                is_delete: 0,
                company_id: req.user.company_id
            },
        });
        return res.status(200).json({ "message": true, "data": role })
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.UpdateUser = async (req, res) => {
    try {
        const role = await User.update({ role: req.body.role }, {
            where: {
                id: req.body.id,
            },
        });
        return res.status(200).json({ status: true, message: "User has been updated" })
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.GetPermission = async (req, res) => {

    const userRole = await User.findOne({ where: { id: req.user.id } });
    if (userRole.role) {
        const role = JSON.parse(userRole.role);
        let AllPermissionId = [];
        let AllPermissionName = [];
        for (let i = 0; i < role.length; i++) {
            let data = role[i];
            let roleDetails = await Role.findOne({
                where: {
                    id: data
                },
                include: [{
                    model: Permission,
                    as: 'permissions',
                    through: { attributes: [] }
                }]
            })
            for (let m = 0; m < roleDetails.permissions.length; m++) {
                const data = roleDetails.permissions[m];
                const module = await Module.findOne({
                    where: { id: data.module }
                })
                if (!AllPermissionId.includes(data.id)) {
                    AllPermissionId.push(data.id)
                    AllPermissionName.push(data.name)
                }
                if (module) {
                    if (!AllPermissionName.includes(module.name)) {
                        AllPermissionName.push(module.name)
                    }
                }
            }
        }

        return res.status(200).json({ status: true, permission: AllPermissionName })
    }
    return res.status(200).json({ status: true, permission: '' })


}

//get total count
exports.GetAllUserCount = async (req, res) => {

    try {
        // Fetch all users with status 1
        const users = await User.findAll({
            where: {
                status: 1,
                company_id: req.user.company_id
            },
        });

        // Calculate the total count of users
        const totalCount = users.length;

        // Respond with the users and total count
        return res.status(200).json({
            message: true,
            totalCountuser: totalCount,
            users: users
        });
    } catch (err) {
        // Handle errors and respond with a 400 status code
        return res.status(400).json(err);
    }
};