const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

AWS.config.update({
  region: "us-east-2",
  credentials: {
    accessKeyId: "AKIASVBLMAYDLJFKDVSM",
    secretAccessKey: "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",
  },
});

const getSecrets = async () => {
  // const secretIds = ['/MyDB/Host','/MyDB/UserName','/MyDB/Password','/MyApi/Url'];
  const secretsManager = new AWS.SecretsManager();

  const secretIds = [
    {
      key: "host",
      value: "/MyDB/Host",
    },
    {
      key: "user",
      value: "/MyDB/UserName",
    },
    {
      key: "password",
      value: "/MyDB/Password",
    },
    {
      key: "lambdaUrl",
      value: "/MyApi/Url",
    },
  ];
  const secrets = {};

  for (const secretId of secretIds) {
    const params = {
      SecretId: secretId.value,
    };

    const data = await secretsManager.getSecretValue(params).promise();

    secrets[secretId.key] = data.SecretString;
  }

  return secrets;
};

let secrets = {};
let db;

app.post("/folder", (req, res) => {
  let { folderName, parentId } = req.body;
  let sql = `INSERT INTO Folders (name, parent_folder_id) VALUES ("${folderName}", ${parentId})`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.send("Folder created...");
  });
});

app.post("/file", async (req, res) => {
  let { fileName, file, parentId } = req.body;

  let response = await axios.post(secrets.lambdaUrl, file);
  console.log("response", response);
  let { metadata, s3Url } = response.data;

  let sql = `INSERT INTO Files (name, s3_url, parent_folder_id, metadata) VALUES ("${fileName}", "${s3Url}", ${parentId}, "${metadata}")`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.send("File uploaded and data stored...");
  });
});

const getFolders = async () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Folders", (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

const getFiles = async () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Files", (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

app.get("/all", async (req, res) => {
  const folders = await getFolders();
  const files = await getFiles();

  const arrangeChildren = (folder) => {
    folder.children = folders
      .filter((f) => f.parent_folder_id === folder.id)
      .map(arrangeChildren);
    folder.documents = files.filter((f) => f.parent_folder_id === folder.id);
    return folder;
  };

  const rootFolders = folders.filter((f) => f.parent_folder_id === null);

  let output = [];

  rootFolders.forEach((folder) => {
    const arrangedFolder = arrangeChildren(folder);
    output = output.concat(arrangedFolder.children, arrangedFolder.documents);
  });
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.send(output);
});

const getFilterdFiles = async (keyword) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM Files WHERE name LIKE "%${keyword}%"`,
      (error, results) => {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
};

app.get("/filtered/:keyword", async (req, res) => {
  let { keyword } = req.params;
  keyword = keyword.replace(/^:/, "");

  console.log("keyword", keyword);

  const folders = await getFolders();
  const files = await getFilterdFiles(keyword);

  const arrangeChildren = (folder) => {
    folder.children = folders
      .filter((f) => f.parent_folder_id === folder.id)
      .map(arrangeChildren);
    folder.documents = files.filter((f) => f.parent_folder_id === folder.id);
    return folder;
  };

  const rootFolders = folders.filter((f) => f.parent_folder_id === null);

  let output = [];

  rootFolders.forEach((folder) => {
    const arrangedFolder = arrangeChildren(folder);
    output = output.concat(arrangedFolder.children, arrangedFolder.documents);
  });
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.send(output);
});

app.listen(3000, async () => {
  secrets = await getSecrets();

  const dbConnectionParams = {
    host: secrets.host,
    user: secrets.user,
    password: secrets.password,
    database: "ShareNotes",
  };
  db = mysql.createConnection(dbConnectionParams);

  db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected...");
  });

  console.log("Server started on port 3000");
  //   Check db schema exists or not and create if not exists
  let sql = `CREATE TABLE IF NOT EXISTS Folders (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), parent_folder_id INT)`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Folders table created...");
  });
  sql = `CREATE TABLE IF NOT EXISTS Files (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), s3_url VARCHAR(255), parent_folder_id INT, metadata VARCHAR(255))`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Files table created...");
  });

  sql = `INSERT INTO Folders (id, name) VALUES (1, 'root') ON DUPLICATE KEY UPDATE name = 'root'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log("Root folder created...");
  });

  sql = `INSERT INTO Folders (id, name, parent_folder_id) VALUES (2, 'CSCI-5409', 1) ON DUPLICATE KEY UPDATE name = 'CSCI-5409'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
  });
});
