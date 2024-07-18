const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const app = express();
const port = process.env.PORT || 3000; // Use process.env.PORT for Heroku

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Users table
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      state VARCHAR(50),
      city VARCHAR(50)
    );
  `;
  try {
    await pool.query(query);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating Users table:', error.message);
  }
};

createUsersTable();

// Register a new user
app.post('/api/register', async (req, res) => {
  const { first_name, last_name, email, password, phone, state, city } = req.body;

  try {
    console.log('Received registration request for email:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, state, city) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [first_name, last_name, email, hashedPassword, phone, state, city]
    );
    console.log('User registered successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error during registration:', error.message);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'An error occurred during registration' });
    }
  }
});

// Login a user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Endpoint to fetch all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM recipes');
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: 'Error fetching recipes' });
  }
});

// New endpoint to fetch recipes by category
app.get('/api/recipes/category', async (req, res) => {
  const { category } = req.query;
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM recipes WHERE category ILIKE $1';
    const result = await client.query(query, [`%${category}%`]);
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching recipes by category:', err);
    res.status(500).json({ error: 'Error fetching recipes by category' });
  }
});

// Endpoint to fetch recipe details by recipe_id
app.get('/api/recipe/:id', async (req, res) => {
  const recipeId = req.params.id;
  try {
    const client = await pool.connect();
    const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [recipeId]);
    const recipe = recipeResult.rows[0];

    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      client.release();
      return;
    }

    client.release();
    res.json(recipe);
  } catch (err) {
    console.error('Error fetching recipe details:', err);
    res.status(500).json({ error: 'Error fetching recipe details', details: err.message });
  }
});

// New endpoint to fetch recipes that can be made with pantry ingredients
app.get('/api/ai-menu', async (req, res) => {
  const query = `
    WITH pantry_ingredients AS (
        SELECT i.id, i.name
        FROM ingredients i
        JOIN pantry p ON LOWER(i.name) LIKE '%' || LOWER(p.name) || '%'
    ), recipe_ingredient_count AS (
        SELECT r.id AS recipe_id, COUNT(DISTINCT ri.ingredient_id) AS total_ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        GROUP BY r.id
    ), matched_ingredient_count AS (
        SELECT r.id AS recipe_id, COUNT(DISTINCT ri.ingredient_id) AS matched_ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN pantry_ingredients pi ON ri.ingredient_id = pi.id
        GROUP BY r.id
    )
    SELECT r.*
    FROM recipes r
    JOIN recipe_ingredient_count ric ON r.id = ric.recipe_id
    JOIN matched_ingredient_count mic ON r.id = mic.recipe_id
    WHERE ric.total_ingredients = mic.matched_ingredients;
  `;

  try {
    const client = await pool.connect();
    const result = await client.query(query);
    const recipes = result.rows;
    client.release();
    res.json(recipes);
  } catch (err) {
    console.error('Error fetching AI Menu recipes:', err);
    res.status(500).json({ error: 'Error fetching AI Menu recipes', details: err.message });
  }
});

// Endpoint to fetch user details by ID
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      client.release();
      return;
    }

    client.release();
    res.json(user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Error fetching user details', details: err.message });
  }
});

// Endpoint to fetch nutritional information for a recipe
app.get('/api/nutrients/:id', async (req, res) => {
  const recipeId = req.params.id;
  try {
    const client = await pool.connect();
    const nutrientsResult = await client.query('SELECT * FROM nutrients WHERE recipe_id = $1', [recipeId]);
    const nutrients = nutrientsResult.rows;

    if (nutrients.length === 0) {
      res.status(404).json({ error: 'Nutritional information not found for this recipe' });
      client.release();
      return;
    }

    client.release();
    res.json(nutrients[0]); // Assuming there's only one set of nutrients per recipe for simplicity
  } catch (err) {
    console.error('Error fetching nutritional information:', err);
    res.status(500).json({ error: 'Error fetching nutritional information', details: err.message });
  }
});

// Endpoint to fetch media details
app.get('/api/media', async (req, res) => {
  try {
    const client = await pool.connect();
    console.log("Database connected successfully");
    const result = await client.query(`
      SELECT 
        m.media_id, 
        m.public_id, 
        m.url, 
        m.type, 
        m.uploaded_at, 
        m.recipe_id, 
        m.author_id,
        u.first_name AS author_first_name, 
        u.last_name AS author_last_name,
        r.description AS recipe_description
      FROM media m
      JOIN users u ON m.author_id = u.id
      JOIN recipes r ON m.recipe_id = r.id
    `);
    console.log("Query executed successfully");
    const media = result.rows.map(row => ({
      ...row,
      url: cloudinary.url(row.public_id, { resource_type: "video" })
    }));
    client.release();
    res.json(media);
  } catch (err) {
    console.error('Error fetching media:', err.message, err.stack);
    res.status(500).json({ error: 'Error fetching media', details: err.message });
  }
});

// Endpoint to upload a recipe and media
app.post('/api/upload', async (req, res) => {
  const {
    title,
    description,
    prep_time,
    cook_time,
    ingredients,
    instructions, // Instructions as part of the recipes table
    category,
    cuisine,
    tags,
    videoUri,
    imageUri,
    userId // Use userId instead of username
  } = req.body;

  console.log('Received upload request with userId:', userId);
  
  const total_time = parseFloat(prep_time) + parseFloat(cook_time);

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // Get user ID directly from the request body
    console.log('Fetching user ID:', userId);
    const userResult = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      console.error('User not found for ID:', userId);
      throw new Error('User not found');
    }
    const fetchedUserId = userResult.rows[0].id;
    console.log('Found user ID:', fetchedUserId);

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(videoUri, {
      resource_type: "video",
      folder: "videos",
      format: "mp4",
      transformation: [
        { aspect_ratio: "9:16", crop: "fill" },
        { quality: "auto" },
        { width: 1080, height: 1920 }
      ],
      eager: [
        { width: 300, height: 500, crop: "pad", audio_codec: "none" }
      ],
      eager_async: true,
      eager_notification_url: "https://mysite.example.com/notify_endpoint"
    });

    const videoMetadata = {
      media_id: videoResult.asset_id,
      public_id: videoResult.public_id,
      url: videoResult.secure_url,
      type: videoResult.resource_type,
      uploaded_at: videoResult.created_at,
    };

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(imageUri, {
      folder: "images",
      format: "jpg",
      transformation: [{ quality: "auto" }],
    });

    const imageMetadata = {
      url: imageResult.secure_url,
      public_id: imageResult.public_id,
    };

    // Insert recipe data into the database
    const recipeResult = await client.query(
      `INSERT INTO recipes (author, title, description, instructions, category, total_time, cook_time, prep_time, cuisine, image, ingredients, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [fetchedUserId, title, description, instructions.join('\n'), category, total_time, cook_time, prep_time, cuisine, imageMetadata.url, ingredients.join('\n'), tags]
    );

    const recipeId = recipeResult.rows[0].id;

    // Insert media metadata into the database
    await client.query(
      `INSERT INTO media (media_id, public_id, url, type, uploaded_at, recipe_id, author_id) 
       VALUES ($1, $2, $3, 'video', NOW(), $4, $5)`,
      [videoMetadata.media_id, videoMetadata.public_id, videoMetadata.url, recipeId, fetchedUserId]
    );

    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Recipe and media uploaded successfully' });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction
    console.error('Error uploading recipe and media:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
