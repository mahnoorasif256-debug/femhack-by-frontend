import{
   auth,
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
   GoogleAuthProvider,
   signInWithPopup,
   signOut,
   sendEmailVerification,
   sendPasswordResetEmail,
   updatePassword,
   getFirestore,
   setDoc,
   doc,
   db,
   serverTimestamp,
   onAuthStateChanged,
   getDoc,
   updateDoc,
   verifyBeforeUpdateEmail
} from "./firebase.config.js"

/////////////////////// sign up /////////////////////

const signup = async (e) => {
  e.preventDefault();

  let name = document.getElementById('signupName');
  let email = document.getElementById('signupEmail');
  let password = document.getElementById('signupPassword');

  if (!email.value || !password.value || !name.value) {
    alert('All fields are required!');
    return; 
  }

  try {
    let userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Role ko hardcode karke 'customer' kar diya hai
    await setDoc(doc(db, "users", user.uid), {
       name: name.value,
       email: email.value,
       role: 'customer', 
       isActive: true,
       timestamp: serverTimestamp()
    });

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      alert('Please check your inbox to verify your Email!');
    }

    alert("Account created successfully!");
    window.location.replace('./login.html');

  } catch (error) {
    console.error("Signup Error:", error.message);
    alert(error.message);
  }
};

document.getElementById('signupForm')?.addEventListener('submit', signup);




// Google Signup Integration
const googleSignupBtn = document.getElementById('googleSignupBtn');
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName || "Google User",
                email: user.email,
                role: 'customer',
                isActive: true,
                timestamp: serverTimestamp()
            }, { merge: true });

            alert("Google Signup Successful!");
            window.location.replace('./index.html');
        } catch (error) {
            console.error("Google Signup Error:", error.message);
            alert(error.message);
        }
    });
}