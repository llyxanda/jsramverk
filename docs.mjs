
import database from './db/database.mjs';
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
                created_at: new Date()
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
            const result = await db.collection.updateOne(
                { _id: objectId },
                { $set: { title: body.title, content: body.content } }
            );
            return result;
        } catch (e) {
            console.error(e);
        } finally {
            await db.client.close();
        }
    }
    };

export default docs;
