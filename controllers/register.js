const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = require('./signin').redisClient;

// Setup Redis:
// const redisClient = redis.createClient(process.env.REDIS_URI);

const handleRegister = (db, bcrypt, req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    return db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
}

const getAuthTokedId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    
    if (err || !reply) {      
      return res.status(400).json('Unauthorized');
    }
    return res.json({ id: reply });
  })
}

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, 'JWT_SECRET', { expiresIn: '2 days' }); // use env variable

}

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value))
}

const createSessions = (user) => {
  // create jwt, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => ({ success: 'true', userId: id, token }))
    .catch(console.log)

}
const registerAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ? getAuthTokedId(req, res) :
    handleRegister(db, bcrypt, req, res)
      .then(data => {
        return data.id && data.email ? createSessions(data) : Promise.reject(data)
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err))
};

module.exports = {
  registerAuthentication: registerAuthentication,
  redisClient: redisClient,
};


