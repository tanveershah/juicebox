const { Client } = require("pg");

const client = new Client("postgres://postgres@localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  try {
    const { rows } = await client.query(
      `SELECT id, username, name, active, location FROM users;`
    );

    return rows;
  } catch (error) {
    throw error;
  }
};

const getAllPosts = async () => {
  try {
    const { rows:postIds } = await client.query(`
          SELECT id FROM posts;
          `);

          const posts = await Promise.all(postIds.map(
              post=>getPostById(post.id)
          ))

    return posts;
  } catch (error) {
    throw error;
  }
};

const getPostsByUser = async (userId) => {
  try {
    const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${userId};
        `);

    return rows;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const {
      rows: [user],
    } = await client.query(`
          SELECT id, username, name, location, active FROM users
          WHERE id=${userId};
          `);

    if (!user) return null;

    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    throw error;
  }
};

const createUser = async ({ username, password, name, location }) => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `INSERT INTO users(username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;`,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
};

const createPost = async ({ authorId, title, content, tags=[] }) => {
  try {
    const {
      rows: [post],
    } = await client.query(
      `INSERT INTO posts("authorId", title, content)
            VALUES ($1, $2, $3)
            RETURNING *;`,
      [authorId, title, content]
    );

    const tagList = await createTags(tags)

    return await addTagsToPost(post.id, tagList)
  } catch (error) {
    throw error;
  }
};

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

const updatePost = async (postId, fields = {}) => {
    const {tags}=fields
    delete fields.tags

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
      if(setString.length){

          await client.query(
            `UPDATE posts
                  SET ${setString}
                  WHERE id=${postId}
                  RETURNING *;`,
            Object.values(fields)
          );
      }

    if (tags===undefined){
        return await getPostById(postId)
    }

    const tagList = createTags(tags)
    const tagListIdString = tagList.map(
        tag=> `${tag.id}`
    ).join(', ')

    await client.query(`
    DELETE FROM post_tags
    WHERE "tagId" NOT IN (${tagListIdString}) AND "postId"=$1;
    `, [postId])

    await addTagsToPost(postId, tagList)

    return await getPostById(postId)
  } catch (error) {
    throw error;
  }
};

const getPostById=async postId=>{
    try {
        const {rows:[post]}= await client.query(`
        SELECT * FROM posts
        WHERE id=$1;
        `, [postId])

        const {rows: tags} = await client.query(`
        SELECT tags.* FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
        `,[postId])

        const {rows: [author]} = await client.query(`
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
        `,[post.authorId])

        post.tags=tags
        post.author=author

        delete post.authorId

        return post
    } catch (error) {
        
    }
}

const createTags= async tagList=>{
    if (!tagList.length) return


}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  getAllPosts,
  updatePost,
  getUserById,
  getPostsByUser
};
