import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzH11Jr0aa9Nwlcan8Yelb3m0EPeIDp9U",
  authDomain: "pg-saas-management.firebaseapp.com",
  projectId: "pg-saas-management",
  storageBucket: "pg-saas-management.appspot.com",
  messagingSenderId: "653608250876",
  appId: "1:653608250876:web:8a885fb529360b24505679",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  try {
    const fileContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // dummy png header
    const fileRef = ref(storage, `test/${Date.now()}.png`);
    console.log("Uploading...");
    const snap = await uploadBytes(fileRef, fileContent, { contentType: "image/png" });
    console.log("Uploaded! Getting URL...");
    const url = await getDownloadURL(snap.ref);
    console.log("Success! URL:", url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

testUpload();
