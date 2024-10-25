
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
    
        try {
            const result = await db.collection.insertOne({
                title: body.title,
                content: body.content,
                created_at: new Date(),
                allowed:  [body.allowed] || []
            });
            return result;
        } catch (e) {
            console.error(e, e.message);
        } finally {
            await db.client.close();
        }
    },
   

    updateOne: async function updateOne(datab, body) {
        let db = await database.getDb(datab);

        try {
            const objectId = new ObjectId(body.id);
            const updateFields = {};

            if (body.title) {
                updateFields.title = body.title;
            }

            if (body.content) {
                updateFields.content = body.content;
            }
            const updateData = { $set: updateFields };

            if (Array.isArray(body.allowed) && body.allowed.length > 0) {
                updateData.$addToSet = { allowed: { $each: body.allowed } };
              }
            console.log('allowed',updateData)
            const updateResult = await db.collection.updateOne(
                { _id: objectId },
                updateData
              );
            console.log('Update Result:', updateResult);
            return { updateResult };
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
