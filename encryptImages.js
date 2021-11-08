import encrypt from "node-file-encrypt";
import fs from "fs";
import readline from "readline-sync";

const decryptKey = readline.question("What is the key? ");

var files = fs.readdirSync("images");
console.log("-1");

let encryptPath = "encrypt/";

let encryptedFiles = fs.readdirSync(encryptPath);

(async () => {
  let encryptedFilesNamePromises = encryptedFiles.map(async (file) => {
    let f = await new encrypt.FileEncrypt(`${encryptPath}/${file}`);
    await f.openSourceFile();
    return await f.info(decryptKey)?.name;
  });

  let encryptedFilesName = await Promise.allSettled(encryptedFilesNamePromises).then(
    (result) =>
      result.filter((res) => res.status == "fulfilled").map((res) => res.value)
  );


  files.forEach(async (file, index) => {
    try {
      encryptedFilesName.forEach((existentFile) => {
        if (file == existentFile) throw "arquivo já existe!!";
      });
      let f = new encrypt.FileEncrypt("images/" + file, `${encryptPath}`);

      f.openSourceFile();
      f.encrypt(decryptKey);

      console.log(index + ": Criptografado com sucesso !!");
    } catch (error) {
      console.log(error || "ocorreu um erro");
    }
  });
})();
