import{
   auth,
   createUserWithEmailAndPassword,
   GoogleAuthProvider,
   signInWithPopup,
   sendEmailVerification,
   getFirestore,
   setDoc,
   doc,
   db,
   serverTimestamp,
   getDoc
} from "./firebase.config.js"

const signup = async (e) => {
  e.preventDefault();

  let name = document.getElementById('signupName');
  let email = document.getElementById('signupEmail');
  let password = document.getElementById('signupPassword');
  let roleSelect = document.getElementById('signupRole');
  let categorySelect = document.getElementById('signupCategory');

  if (!email.value || !password.value || !name.value || !roleSelect.value) {
    alert('All fields including Role are required!');
    return; 
  }

  let role = roleSelect.value;
  let category = role === 'provider' ? (categorySelect ? categorySelect.value : '') : '';

  if (role === 'provider' && !category) {
    alert('Please select your business service category!');
    return;
  }

  try {
    let userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    let userData = {
       name: name.value,
       email: email.value,
       role: role,
       isActive: true,
       timestamp: serverTimestamp()
    };

    if (role === 'provider') {
      userData.category = category;
      userData.serviceCategory = category;
      userData.businessName = name.value + "'s Business";
    }

    await setDoc(doc(db, "users", user.uid), userData);

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      alert('Account created successfully! Please check your inbox to verify your Email.');
    } else {
      alert("Account created successfully!");
    }

    window.location.replace('./login.html');

  } catch (error) {
    console.error("Signup Error:", error.message);
    alert(error.message);
  }
};

document.getElementById('signupForm')?.addEventListener('submit', signup);

const googleSignupBtn = document.getElementById('googleSignupBtn');
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            let role = 'customer';
            let category = '';
            let name = user.displayName || "Google User";

            if (userDoc.exists()) {
                const userData = userDoc.data();
                role = userData.role || 'customer';
                category = userData.category || '';
                name = userData.name || name;
            } else {
                let chosenRole = prompt("Aap kis tarah account banana chahte hain? Type karein:\n1. customer\n2. provider", "customer");
                
                let providerData = {};
                if (chosenRole && chosenRole.toLowerCase().includes('prov')) {
                    role = 'provider';
                    let chosenCategory = prompt("Aapka business kis category ka hai? Type karein:\n- Electrician\n- Home Cleaner\n- Plumber\n- AC Technician\n- Carpenter\n- Painter", "Electrician");
                    category = chosenCategory || "Electrician";
                    
                    providerData = {
                        role: role,
                        category: category,
                        serviceCategory: category,
                        businessName: name + "'s Business"
                    };
                } else {
                    role = 'customer';
                    providerData = {
                        role: role
                    };
                }

                await setDoc(userDocRef, {
                    name: name,
                    email: user.email,
                    isActive: true,
                    timestamp: serverTimestamp(),
                    ...providerData
                });
            }

            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                name: name,
                email: user.email,
                role: role,
                category: category,
                profileImg: userDoc.exists() ? (userDoc.data().profileImg || '') : ''
            }));

            alert(`Google Signup Successful as ${role} ${category ? '(' + category + ')' : ''}!`);
            
            if (role === 'provider') {
                window.location.replace('./provider/provider.html');
            } else {
                window.location.replace('./customer/customer.html');
            }

        } catch (error) {
            console.error("Google Signup Error:", error.message);
            alert(error.message);
        }
    });
}