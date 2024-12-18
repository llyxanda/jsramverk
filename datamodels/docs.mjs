
import database from '../db/database.mjs';
import { ObjectId } from 'mongodb';
const docs = {
    getAll: async function getAll(datab) {
        let db = await database.getDb(datab);

        try {
            //console.log(db);
            return await db.collection.find().toArray();
 
            //return await db.all('SELECT rowid as id, * FROM documents');
        } catch (e) {
            console.error(e, e.message);
            return [];
        } finally {
            await db.client.close();
        }
    },

    getOne: async function getOne(datab, id) {
        let db = await database.getDb(datab);
        const objectId = new ObjectId(id);
    
        try {
            return await db.collection.findOne({ _id: objectId });
        } catch (e) {
            console.error(e);
            return null;
        } finally {
            await db.client.close();
        }
    },

    addOne: async function addOne(datab, body) {
        let db = await database.getDb(datab);
        console.log('body',body)
        try {
            const result = await db.collection.insertOne({
                title: body.title,
                content: body.content,
                code: body.code || false,
                created_at: new Date(),
                allowed: Array.isArray(body.allowed) ? body.allowed : [],
            });
            return {_id:result.insertedId};
        } catch (e) {
            console.error(e, e.message);
        } finally {
            await db.client.close();
        }
    },
   

    updateOne: async function updateOne(datab = 'documents', body) {
        let db = await database.getDb(datab);

        try {
            console.log(body)
            const objectId = new ObjectId(body.id);
            const updateFields = {};

            if (body.title) {
                updateFields.title = body.title;
            }

            if (body.content) {
                updateFields.content = body.content;
            }

            if (typeof body.code === 'boolean') {
                updateFields.code = body.code;
            }
            const updateData = { $set: updateFields };

            if (Array.isArray(body.allowed) && body.allowed.length > 0) {
                updateData.$addToSet = { allowed: { $each: body.allowed } };
              }
            console.log('allowed', updateData)
            const updateResult = await db.collection.updateOne(
                { _id: objectId },
                updateData
              );
            console.log('Update Result:', updateResult);
            return { _id: updateResult.modifiedCount };
        } catch (e) {
            console.error(e);
            throw new Error("An error occurred while updating the document.");
        } finally {
            await db.client.close();
        }
    },


    deleteAll: async function deleteAll(datab) {
        let db = await database.getDb(datab);

        try {
            // Drop the entire database
            await db.collection.deleteMany({});
            console.log(`Data has been deleted.`);
        } catch (e) {
            console.error(e);
            throw new Error("An error occurred while deleting the data.");
        } finally {
            await db.client.close();
        }
    },
    getAllForUser: async function getAllForUser(datab, userId) {
        let db = await database.getDb(datab);
        try {
            return await db.collection.find({ allowed: userId }).toArray();
        } catch (e) {
            console.error(e, e.message);
            return [];
        } finally {
            await db.client.close();
        }
    }
};
export default docs;
