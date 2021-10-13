const { Client } = require("pg");

const client = new Client("postgres://postgres@localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  const { rows } = await client.query(
    `SELECT id, username, name, active, location FROM users;`
  );

  return rows;
};

const getAllPosts = async ()=>{
    const {rows}= await client.query(`
    SELECT * FROM posts;
    `)
}

const getPostsByUser=async(userId)=>{
    try {
        const {rows}=client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${userId};
        `)

        return rows
    } catch (error) {
        throw error
    }
}

const createUser = async ({ username, password, name, location }) => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `INSERT INTO users(username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *`,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
};

const createPost = async({authorId, title, content})=>{
    try {
        const {rows:[user]}= await client.query(
            `INSERT INTO posts(authorId, title, content)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [authorId, title, content]
        );

        return user
    } catch (error) {
        throw error
    }
}

const updateUser = async (id, fields = {}) => {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (id, {title, content, active})=>{
    try {
        const {rows:[user]}= await client.query(
            `UPDATE posts
            SET title=$1, content=$2, active=$3
            WHERE id=${id}
            RETURNING *`,
            [title, content, active]
        )
    } catch (error) {
        
    }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
};
