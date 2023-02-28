let server;
const request = require('supertest');


/* 
=========================================================================
  For Integration Test for-integration-test.js will hold the connection 
=========================================================================
*/ 

describe('/GET File',()=>{
   beforeEach(()=>{server = require('../../for-integration-test')}); 
   afterEach(()=>{server.close()});
   describe('get request /',()=>{
     it('Image list default 8 image',async ()=>{
       // Image list default 9 image
       const allRecord = await request(server).get('/file/security-image/get');
       expect(allRecord.status).toBe(200);
     });
   });

   describe("/POST Create user", () => {
    it("should return 200 for succesfull order creation", async () => {

    const createNewUser = await request(server)
      .post("/user/create")
      .send({
        "salutation": "Mr.",
        "name": "Datu Alan Goh",
        "email": "dag@i-serve.com",
        "country": "Malaysia",
        "password": "123456",
        "zappId": "dag183099",
        "contact": "612345678911",
        "tpin": "123456",
        "touchId": true,
        "faceId": true,
        "securityImage": "/33/border.png",
        "inviteCodeBool": true,
        "inviteCode": "s2o0ajM4k7",
        "currency": "MYR"
      });
      expect(createNewUser.status).toBe(200);
    });
  });

   describe("/POST Order", () => {
      it("should return 200 for succesfull order creation", async () => {
      //login First
      const token = await request(server)
        .post("/authenticate")
        .send({ credential : "asad183099", password: "123456" });
      const gotToken = token.body["x-access-token"];

      const newOrderCreation = await request(server)
        .post("/payment/order")
        .set("x-access-token", gotToken)
        .send({
          "transactionType": "Topup",
          "orderDetail": "Zapp Reload",
          "orderAmount": "200"
        });
        expect(newOrderCreation.status).toBe(200);
      });
    });

    /*
     While executing this test dont get confused seeing waring message. 
     This is because internally we are using third party api   
    */
    describe("/POST Sms Tac", () => {
      it("should return 200 for succesfull SMS tac sending", async () => {

      const newOrderCreation = await request(server)
        .post("/user/sms-tac")
        .send({
          "PhoneNo": "60138596067"
        });
        expect(newOrderCreation.status).toBe(200);
      });
    });


    describe("/GET Generate invite code", () => {
      it("should return 200 for succesfull invite code generation", async () => {
      //login First
      const token = await request(server)
        .post("/authenticate")
        .send({ credential : "asad183099", password: "123456" });
      const gotToken = token.body["x-access-token"];

      const newInviteCode = await request(server)
        .get("/user/invite-code/generate")
        .set("x-access-token", gotToken)
        .send({});
        expect(newInviteCode.status).toBe(200);
        expect(newInviteCode.body.message).toBe("Invitation Code generated");
      });
    });


});