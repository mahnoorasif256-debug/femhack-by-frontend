import {
   auth,
   signInWithEmailAndPassword,
   GoogleAuthProvider,
   signInWithPopup,
   getFirestore,
   setDoc,
   serverTimestamp,
   doc,
   db,
   getDoc
} from "./firebase.config.js";

const login = async (e) => {
  e.preventDefault();

  let email = document.getElementById('loginEmail');
  let password = document.getElementById('loginPassword');

  if (!email.value || !password.value) {
    alert("Please fill all fields!");
    return;
  }

  try {
    // 1. User authentication
    let userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // 2. Firestore se user ka role fetch karna
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // User data ko localStorage mein save karna
        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            name: userData.name,
            email: userData.email,
            role: role,
            profileImg: userData.profileImg || ''
        }));

        alert("Logged in successfully!");

        // 3. Folder structure ke mutabiq sahi page par redirection
        if (role === 'provider') {
            window.location.replace('./provider/provider.html');
        } else {
            window.location.replace('./customer/customer.html');
        }
    } else {
        alert("User record not found in database!");
    }

  } catch (error) {
    console.error("Login Error:", error.message);
    alert(error.message);
  }
};

// Login form submit event listener (Apni HTML file ke login form ki ID yahan check kar lein)
document.getElementById('loginForm')?.addEventListener('submit', login);

// Google Login button event listener
const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Firestore me user ka record check karo, agar naya hai to bana do
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            let role = 'customer';
            let name = user.displayName || 'Google User';

            if (userDoc.exists()) {
                const userData = userDoc.data();
                role = userData.role || 'customer';
                name = userData.name || name;
            } else {
                await setDoc(userDocRef, {
                    name: name,
                    email: user.email,
                    role: role,
                    isActive: true,
                    timestamp: serverTimestamp()
                });
            }

            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                name: name,
                email: user.email,
                role: role,
                profileImg: userDoc.exists() ? (userDoc.data().profileImg || '') : ''
            }));

            alert("Logged in successfully!");

            if (role === 'provider') {
                window.location.replace('./provider/provider.html');
            } else {
                window.location.replace('./customer/customer.html');
            }
        } catch (error) {
            console.error("Google Login Error:", error.message);
            alert(error.message);
        }
    });
}