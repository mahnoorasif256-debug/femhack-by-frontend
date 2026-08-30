import{
   auth,
   createUserWithEmailAndPassword,
   GoogleAuthProvider,
   signInWithPopup,
   sendEmailVerification,
   sendPasswordResetEmail,
   getFirestore,
   setDoc,
   doc,
   db,
   serverTimestamp,
   getDoc
} from "./firebase.config.js"

/////////////////////// sign up /////////////////////

const signup = async (e) => {
  e.preventDefault();

  let name = document.getElementById('signupName');
  let email = document.getElementById('signupEmail');
  let password = document.getElementById('signupPassword');
  let roleSelect = document.getElementById('signupRole');

  if (!email.value || !password.value || !name.value || !roleSelect.value) {
    alert('All fields including Role are required!');
    return; 
  }

  try {
    let userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Dropdown se select kiya hua role yahan save hoga
    await setDoc(doc(db, "users", user.uid), {
       name: name.value,
       email: email.value,
       role: roleSelect.value, // 'customer' ya 'provider'
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


// Google Signup Integration (Default role customer, ya popup through handle kar sakti hain)
const googleSignupBtn = document.getElementById('googleSignupBtn');
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName || "Google User",
                    email: user.email,
                    role: 'customer', // Google signup default as customer
                    isActive: true,
                    timestamp: serverTimestamp()
                });
            }

            alert("Google Signup Successful!");
            window.location.replace('./customer/customer.html');
        } catch (error) {
            console.error("Google Signup Error:", error.message);
            alert(error.message);
        }
    });
}