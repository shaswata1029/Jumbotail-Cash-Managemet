const router = require("express").Router();
const User = require("../models/User");
const Entity = require("../models/Entity");
const Transaction = require("../models/Transaction");

// const authCheck = (req, res, next) => {
//       if(!req.user){
//           res.redirect('/auth/login');
//       } else {
//           next();
//       }
//   };

router.get("/", (req, res) => {
  console.log(req);
  res.send("Welcome " + req.user.username);
});

// Of all the entites, returns an array of entites that belongs to the current user
async function findEntities(entities, id) {
  let entityList = [];
  for (let entity of entities)
    try {
      console.log(entity);
      if (entity.host._id == id) entityList.push(entity);
      console.log(entityList);
    } catch (e) {
      console.log(e);
    }
  return entityList;
}

// Of all the entites, returns an array of entites that belongs to the current user
async function getAllEntities(entities) {
  let entityList = [];
  for (let entity of entities)
    try {
      console.log(entity);
        const tempEntity = {
          username: entity.username,
          _id: entity._id,
        };
        entityList.push(tempEntity);
    } catch (e) {
      console.log(e);
    }
  return entityList;
}

router.get("/entityList/:id", async (req, res) => {
  /*
      - Find all entities
      - If the entity host is current user, add it to the list
      - Return the list
       */

  //let entityList = [];

  const entities = await Entity.find().populate("host");
  const id = req.params.id;
  //console.log(entities);

  findEntityList(entities, id)
    .then((foundList) => {
      res.status(200).json(foundList);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ message: err.message });
    });
});

//Example cURL request
/*
curl --location --request GET 'http://localhost:3000/entity/604a1ec3d7f2b33c341847bf'
*/

//Get all entities of current user

router.get("/entity/:id", async (req, res) => {
  /*
      - Find all entities
      - If the entity host is current user, add it to the list
      - Return the list
       */

  //let entityList = [];

  const entities = await Entity.find().populate("host");

  //console.log(entities);

  findEntities(entities, req.params.id)
    .then((foundList) => {
      res.status(200).json(foundList);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ message: err.message });
    });
});

//Example CURL Request
/*
curl --location --request POST 'http://localhost:3000/entity' \
--header 'Content-Type: application/json' \
--data-raw '{
"username": "John",
"userType": "CUSTOMER",
"hostId": "604a1ec3d7f2b33c341847bf"
}'
*/

//Post an entity for the current user
router.post("/entity", async (req, res) => {
  //Form the entity object from the request
  const entity = req.body;

  console.log(entity);

  const newEntity = new Entity({
    username: entity.username,
    userType: entity.userType,
    host: entity.hostId,
    address: entity.address,
    mobile: entity.mobile,
  });

  try {
    await newEntity.save();
    console.log(newEntity);
    res.status(201).json(newEntity);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
});

//Of all the transactions, select the transactions of current user and push it to an array
async function findTransactions(transactions, id) {
  let transactionList = [];
  for (let transaction of transactions)
    try {
      console.log(transaction);
      if (transaction.host._id == id) transactionList.push(transaction);
      console.log(transactionList);
    } catch (e) {
      console.log(e);
    }
  return transactionList;
}

router.get("/entity", async (req, res) => {
      /*
          - Find all entities
          - If the entity host is current user, add it to the list
          - Return the list
           */
    
      //let entityList = [];
    
      const entities = await Entity.find().populate("host");
    
      //console.log(entities);
    
      getAllEntities(entities)
        .then((foundList) => {
          res.status(200).json(foundList);
        })
        .catch((err) => {
          console.log(err);
          res.status(404).json({ message: err.message });
        });
    });

router.patch("/entity/:id", async (req, res) => {
  const entityId = req.params.id;

  if (entityId.match(/^[0-9a-fA-F]{24}$/)) {
    const entity = await Entity.findOne({ _id: entityId }).populate("host");

    if (entity) {
      if (req.body.username) {
        entity.username = req.body.username;
      }

      if (req.body.userType) {
        entity.userType = req.body.userType;
      }

      if (req.body.address) {
        entity.address = req.body.address;
      }

      if (req.body.mobile) {
        entity.mobile = req.body.mobile;
      }

      if (req.body.hostId) {
        entity.host = req.body.hostId;
      }

      try {
        await entity.save();
        res.status(201).json({ id: entity._id });
      } catch (error) {
        res.status(404).json({ message: error.message });
      }
    } else {
      res.status(400).json({ InvalidID: "entity with the ID doesn't exist" });
    }
  } else {
    res.status(404).json({
      invalid_id: "entity with ID not found, please provide a valid ID",
    });
  }
});

//Example cURL request
/*
curl --location --request GET 'http://localhost:3000/transaction/604a1ec3d7f2b33c341847bf'
*/
//Get all transactions of current user
router.get("/transaction/:id", async (req, res) => {
  /*
            - Find all transactions
            - Of all transactions, filter the current user transactions
            - Push it to an array
            - Send it as a JSON 
      */

  const transactions = await Transaction.find()
    .populate("entity")
    .populate("host");

  findTransactions(transactions, req.params.id)
    .then((foundList) => {
      res.status(200).json(foundList);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ message: err.message });
    });
});

//Example cURL request
/*
curl --location --request POST 'http://localhost:3000/transaction' \
--header 'Content-Type: application/json' \
--data-raw '{
    "transactionType": "CREDIT",
    "entityId": "604a20ee75007280acc1a048",
    "hostId": "604a1ec3d7f2b33c341847bf",
    "amount": 15000
}'
*/
router.post("/transaction", async (req, res) => {
  const transaction = req.body;

  const newTransaction = new Transaction({
    transactionType: transaction.transactionType,
    entity: transaction.entityId,
    amount: transaction.amount,
    host: transaction.hostId,
    paymentMode: transaction.paymentMode,
    transactionTime: transaction.transactionTime,
    remarks:transaction.remarks
  });

  try {
    await newTransaction.save();
    res.status(201).json({ id: newTransaction._id });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/*
Example: 
curl --location --request PATCH 'http://localhost:8000/transaction/604c63d9cbb44151e8450908' \
--header 'Content-Type: application/json' \
--data-raw '{
    "paymentMode": "Debit Card",
    "transactionTime": "2021-03-22"
}'
*/

router.patch("/transaction/:id", async (req, res) => {
  const transactionId = req.params.id;

  if (transactionId.match(/^[0-9a-fA-F]{24}$/)) {
    const transaction = await Transaction.findOne({ _id: transactionId })
      .populate("entity")
      .populate("host");

    if (transaction) {
      if (req.body.transactionType) {
        transaction.transactionType = req.body.transactionType;
      }

      if (req.body.amount) {
        transaction.amount = req.body.amount;
      }

      if (req.body.paymentMode) {
        transaction.paymentMode = req.body.paymentMode;
      }

      if (req.body.transactionTime) {
        transaction.transactionTime = req.body.transactionTime;
      }

      if (req.body.entityId) {
        transaction.entity = req.body.entityId;
      }

      if (req.body.hostId) {
        transaction.host = req.body.hostId;
      }

      try {
        await transaction.save();
        res.status(201).json({ id: transaction._id });
      } catch (error) {
        res.status(404).json({ message: error.message });
      }
    } else {
      res
        .status(400)
        .json({ InvalidID: "Transaction with the ID doesn't exist" });
    }
  } else {
    res.status(404).json({
      invalid_id: "Transaction with ID not found, please provide a valid ID",
    });
  }
});

module.exports = router;
