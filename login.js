import {
   auth,
   signInWithEmailAndPassword,
   GoogleAuthProvider,
   signInWithPopup,
   sendPasswordResetEmail,
   getFirestore,
   setDoc,
   serverTimestamp,
   doc,
   db,
   getDoc
} from "./firebase.config.js";

function goAfterLogin(role) {
  const redirect = sessionStorage.getItem('redirectAfterLogin');
  if (redirect) {
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.replace(redirect);
    return;
  }

  if (role === 'provider') {
    window.location.replace('./provider/provider.html');
  } else {
    window.location.replace('./customer/customer.html');
  }
}

const login = async (e) => {
  e.preventDefault();

  let email = document.getElementById('loginEmail');
  let password = document.getElementById('loginPassword');

  if (!email.value || !password.value) {
    alert("Please fill all fields!");
    return;
  }

  try {
    let userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            name: userData.name,
            email: userData.email,
            role: role,
            profileImg: userData.profileImg || ''
        }));

        alert("Logged in successfully!");
        goAfterLogin(role);
    } else {
        alert("User record not found in database!");
    }

  } catch (error) {
    console.error("Login Error:", error.message);
    alert(error.message);
  }
};

document.getElementById('loginForm')?.addEventListener('submit', login);

const sendResetBtn = document.getElementById('sendResetBtn');
if (sendResetBtn) {
    sendResetBtn.addEventListener('click', async () => {
        const resetEmail = document.getElementById('resetEmail').value;
        if (!resetEmail) {
            alert("Please enter your email address first!");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            alert("Password reset link sent to your email!");
            const modalEl = document.getElementById('forgotPasswordModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } catch (error) {
            console.error("Reset Error:", error.message);
            alert(error.message);
        }
    });
}

const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            let role = 'customer';
            let name = user.displayName || 'Google User';

            if (userDoc.exists()) {
                const userData = userDoc.data();
                role = userData.role || 'customer';
                name = userData.name || name;
            } else {
                let chosenRole = prompt("Aap kis tarah account banana chahte hain? Type karein:\n1. customer\n2. provider", "customer");
                
                if (chosenRole && chosenRole.toLowerCase().includes('prov')) {
                    role = 'provider';
                } else {
                    role = 'customer';
                }

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

            alert(`Logged in successfully as ${role}!`);
            goAfterLogin(role);
        } catch (error) {
            console.error("Google Login Error:", error.message);
            alert(error.message);
        }
    });
}