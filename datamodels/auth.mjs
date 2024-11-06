import database from '../db/database.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const jwtSecret = process.env.JWTSECRET;
const auth = {
    register: async function(res, body) {
        const email = body.email.toLowerCase();
        const password = body.password;
    
        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/register",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }
    
        bcrypt.hash(password, 10, async function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }
    
            let db;
    
            try {
                db = await database.getDb('users');
                //await db.collection.deleteMany({});
                // Check if a user with the same email already exists
                const existingUser = await db.collection.findOne({ "email": email });

                if (existingUser) {
                    return res.status(409).json({
                        errors: {
                            status: 409,
                            source: "/register",
                            title: "Email already registered",
                            detail: "A user with the provided email already exists."
                        }
                    });
                }
    
                let updateDoc = {
                            email: email,
                            password: hash
                };
    
                // Insert the new user
                await db.collection.insertOne(updateDoc);
    
                return res.status(201).json({
                    data: {
                        message: "User successfully registered."
                    }
                });
            } catch (e) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: "/register",
                        title: "Database error",
                        detail: e.message
                    }
                });
            } finally {
                await db.client.close();
            }
        });
    },
    login: async function(res, body) {
        const email = body.email;
        const password = body.password;

        if (!email || !password) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "Email or password missing",
                    detail: "Email or password missing in request"
                }
            });
        }

        let db;

        try {
            db = await database.getDb('users');

            const user = await db.collection.findOne({ email: email });
            console.log(user)
            if (!user) {
                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "User not found",
                        detail: "User with provided email not found."
                    }
                });
            }

            // Use bcryptjs to compare passwords
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: "/login",
                            title: "bcrypt error",
                            detail: "bcrypt error"
                        }
                    });
                }

                if (result) {
                    let payload = { email: user.email };
                    let jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });

                    return res.json({
                        data: {
                            type: "success",
                            message: "User logged in",
                            user: payload,
                            token: jwtToken
                        }
                    });
                }

                return res.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "Wrong password",
                        detail: "Password is incorrect."
                    }
                });
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/login",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },

    getAllUsers: async function(res) {
        let db;

        try {
            db = await database.getDb('users');
            const users = await db.collection.find({}).toArray();

            return res.status(200).json({
                data: {
                    users: users
                }
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/users",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();  // Ensure the database connection is closed
        }
    },
    deleteAllData: async function(res) {
        let db;

        try {
            db = await database.getDb('users');

            // Delete all documents in the collection
            const result = await db.collection('yourCollectionName').deleteMany({});

            return res.status(200).json({
                data: {
                    message: `Successfully deleted ${result.deletedCount} documents.`
                }
            });
        } catch (e) {
            return res.status(500).json({
                errors: {
                    status: 500,
                    source: "/delete-all",
                    title: "Database error",
                    detail: e.message
                }
            });
        } finally {
            await db.client.close();
        }
    },
};
export default auth;
