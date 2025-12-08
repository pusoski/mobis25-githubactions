const admin = require('firebase-admin');

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
  const snippet = recipe.instructions.substring(0, 100) + '...';

  const message = {
    topic: 'all',

    notification: {
      title: recipe.title,
      body: snippet,
    },

    data: {
      title: recipe.title,
      body: snippet,
      image: recipe.image,
      idMeal: recipe.idMeal,
      recipe: JSON.stringify(recipe),
    },

    android: {
      priority: 'high',
      notification: {
        channelId: 'high_importance_channel',
        priority: 'max',
        defaultSound: true,
        imageUrl: recipe.image,
      },
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
