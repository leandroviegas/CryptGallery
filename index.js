import express, { response, Router } from "express";
import encrypt from "node-file-encrypt";
import readline from 'readline-sync';
import cors from "cors";
import fs from "fs";
import mime from "mime";

const decryptKey = readline.question('What is the key? ')

var app = express();

app.use(cors());

const router = Router();

const clearCache = () => fs
  .readdirSync("cache")
  .forEach((file) => fs.unlinkSync("cache/" + file));

router.get("/image/:image", (req, res) => {
  clearCache();

  var image = req.params.image;
  let f = new encrypt.FileEncrypt(`encrypt/${image}`, "cache");
  f.openSourceFile();
  f.decrypt(decryptKey);

  const imageResp = Buffer.from(
    fs.readFileSync(f.decryptFilePath, { encoding: "base64" }),
    "base64"
  );


  res.writeHead(200, {
    "Content-Type": mime.getType(f.decryptFilePath),
    "Content-Length": imageResp.length,
  });

  clearCache();
  
  res.end(imageResp);
});

router.get("/", (req, res) => {
  const perpage = Number(req.query.perpage || 15);
  const page = Number(req.query.page || 1);
  const url = "http://localhost:3333/image";

  let files = fs.readdirSync("encrypt/");

  clearCache();

  files = files
    .filter((v, i) => {
      const initial = perpage * page;
      return i > initial && i < initial + perpage;
    });

  return res.send({
    files,
    page,
    perpage,
    url,
  });
});

app.use(router);

app.listen("3333", () => {
  console.log("Server is running.");
});
