const admin = require('firebase-admin');

// Initialize Firebase Admin with the service account key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function fetchRecipe() {
  const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
  const data = await response.json();
  const meal = data.meals[0];
  return {
    title: meal.strMeal,
    instructions: meal.strInstructions,
    image: meal.strMealThumb,
    idMeal: meal.idMeal,
  };
}

async function sendNotification(recipe) {
  // Send data-only message
  const message = {
    topic: 'all', // send to all devices subscribed to 'all'
    data: {
      title: recipe.title,
      body: recipe.instructions.substring(0, 100) + '...', // short snippet
      image: recipe.image,
      idMeal: recipe.idMeal, // <-- add this
      recipe: JSON.stringify(recipe), // full recipe data
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent, message ID:', response);
  } catch (err) {
    console.error('Error sending notification:', err);
  }
}

(async () => {
  try {
    const recipe = await fetchRecipe();
    await sendNotification(recipe);
  } catch (err) {
    console.error('Error:', err);
  }
})();
