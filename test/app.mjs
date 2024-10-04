
/* global it describe */

process.env.NODE_ENV = 'test';

import { use} from 'chai'
import chaiHttp from 'chai-http'

import server from '../app.mjs';
import HTMLParser from 'node-html-parser'
import database from '../db/database.mjs';
import documents from "../docs.mjs";

const collectionName = 'documents'; 


const chai = use(chaiHttp);
chai.should();

describe('app', () => {
    describe('GET /', () => {
        it('200 HAPPY PATH getting base', (done) => {
            chai.request.execute(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('page should contain H1 API Documentation', (done) => {
            chai.request.execute(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.a("string");

                    let HTMLResponse = HTMLParser.parse(res.text);
                    let mainElement = HTMLResponse.querySelector('main');
        
                    // Check if the main element exists
                    mainElement.should.be.an("object");
        
                    // Now check for the h1 inside the main element
                    let h1Element = mainElement.querySelector('h1');
        
                    // Check if the h1 element exists
                    h1Element.should.be.an("object");
        
                    var h1Text = h1Element.childNodes[0].rawText;
                    h1Text.should.equal("API Documentation");
        
                    done();
                });
        });
    });
    describe('POST /new', async function() {
        before(async () => {
            const db = await database.getDb(collectionName);

            try {
                // Check if the collection exists
                const info = await db.db.listCollections({ name: collectionName }).next();
                
                if (info) {
                    // Drop the collection if it exists
                    await db.db.collection(collectionName).drop();
                    console.log(`Collection ${collectionName} dropped.`);
                }
            } catch (err) {
                console.error('Error during collection drop:', err);
            } finally {
                await db.client.close();
            }
        });
    
        it('should create a new document and return the created document', (done) => {
            const newDocument = {
                title: 'Test Document 1',
                content: 'Test document content.'
            };
            chai.request.execute(server)
                .post('/posts/new')
                .send(newDocument)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('success').eql(true);
                    res.body.should.have.property('data');
                    const addedDocument = await documents.getOne('documents', res.body.data.insertedId);
                    addedDocument.should.include(newDocument);
                    done();
                });
            });

        describe('GET /posts/:id', async () => {
                 let newDocumentId;
            
                // Hook to add a document to the database before the GET test
                before(async function() {
                    // Add a new document
                    const newDocument = {
                        title: 'Test Document for GET',
                        content: 'Test content for GET request.'
                    };
            
                    // Send a POST request to add a new document
                    const res = await chai.request.execute(server)
                        .post('/posts/new')
                        .send(newDocument);
                    
                    res.should.have.status(200);
                    res.body.should.have.property('success').eql(true);
                    res.body.should.have.property('data');
            
                    // Store the ID of the newly added document for the GET test
                    newDocumentId = res.body.data.insertedId;
                    console.log('document id1', newDocumentId, res.body);
                });
            
                // Test case for fetching the document by ID
                it('should fetch the document by ID', async function() {
                    console.log('document id', newDocumentId);
                    // Send a GET request to fetch the document by ID
                    const res = await chai.request.execute(server)
                        .get(`/posts/${newDocumentId}`);
                    
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('title').eql('Test Document for GET');
                    res.body.should.have.property('content').eql('Test content for GET request.');
                    //done();
                });
            });
    });


    describe('Document update POST/:id', () => {
        let newDocumentId;

        // Hook to add a new document before running the tests
        before(async () => {
            const newDocument = {
                title: 'Test Document for update 1',
                content: 'Test document for update content.'
            };

            try {
                const insertedDocument = await documents.addOne('documents', newDocument);
                newDocumentId = insertedDocument.insertedId;
                console.log(`Inserted document with ID: ${newDocumentId}`);
            } catch (err) {
                console.error('Error inserting document:', err);
            }
        });

        // Test for modifying the document
        it('should modify the document via POST /posts/:id', async function() {
            const updatedDocument = {
                title: 'Updated Test Document',
                content: 'Updated content for document.'
            };

            chai.request.execute(server)
                .post(`/posts/${newDocumentId}`)
                .send(updatedDocument)
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('success').eql(true);

                    const modifiedDocument = await documents.getOne('documents', newDocumentId);
                    modifiedDocument.should.include(updatedDocument);
                    done();
                });
        });

        // Test for fetching the modified document via GET
        it('should fetch the modified document by ID via GET /posts/:id', async function() {
            chai.request.execute(server)
                .get(`/posts/${newDocumentId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('title').eql('Updated Test Document');
                    res.body.should.have.property('content').eql('Updated content for document.');
                    //done();
                });
        });
    });

});
