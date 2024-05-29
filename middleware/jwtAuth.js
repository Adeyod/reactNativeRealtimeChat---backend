import jwt from 'jsonwebtoken';

const generateAccessToken = async (email, userId, res) => {
  try {
    const payload = {
      email,
      userId,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '10days',
    });

    return token;
  } catch (error) {
    console.log(error);
  }
};

export { generateAccessToken };
