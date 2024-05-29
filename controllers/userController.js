import { uploadFile } from '../middleware/cloudinary.js';
import { generateAccessToken } from '../middleware/jwtAuth.js';
import { forgotPasswordMail, verifyEmail } from '../middleware/nodemailer.js';
import Token from '../models/tokenModel.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const generateRandomToken = () => {
  const token = Math.floor(100000 + Math.random() * 900000);
  return token.toString();
};

const forbiddenCharsRegex = /[|!{}()&=[\]===><>]/;

const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const image = req.file;

    if (!image || image === undefined || image === null) {
      return res.json({
        error: 'Image not found',
        status: 400,
        success: false,
      });
    }

    if (!name || !email || !password || !confirmPassword) {
      return res.json({
        error: 'All fields are required',
        success: false,
        status: 400,
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (forbiddenCharsRegex.test(trimmedName)) {
      return res.json({
        error: 'Invalid character for field name',
        status: 400,
        success: false,
      });
    }

    if (forbiddenCharsRegex.test(trimmedEmail)) {
      return res.json({
        error: 'Invalid character for field email',
        success: false,
        status: 400,
      });
    }

    // check the email field to prevent input of unwanted characters
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        status: 400,
        success: false,
      });
    }

    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    if (password !== confirmPassword) {
      return res.json({
        error: 'Password do not match',
        success: false,
        status: 400,
      });
    }

    const emailExist = await User.findOne({ email: trimmedEmail });
    if (emailExist) {
      return res.json({
        error: 'Email already exists',
        success: false,
        status: 400,
      });
    }

    const uploadImage = await uploadFile(req, res);

    if (!uploadImage) {
      return res.json({
        error: 'Unable to upload image',
        success: false,
        status: 400,
      });
    }

    const imageToSave = {
      publicId: uploadImage.publicId,
      signature: uploadImage.signature,
      url: uploadImage.url,
      assetId: uploadImage.assetId,
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await new User({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      image: imageToSave,
    }).save();

    const token = generateRandomToken();

    const newToken = await new Token({
      userId: newUser._id,
      token,
    }).save();

    const sendToken = await verifyEmail(
      newToken.token,
      newUser.email,
      newUser.name
    );

    return res.json({
      message:
        'Registration successful. Please verify your email with the token sent to you. Token expires in 15 minutes.',
      status: 201,
      success: true,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    const trimmedEmail = email.trim();
    // check the email field to prevent input of unwanted characters
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        status: 400,
        success: false,
      });
    }

    const findUser = await User.findOne({ email: trimmedEmail });

    if (!findUser) {
      return res.json({
        error: 'Invalid Credentials',
        success: false,
        status: 400,
      });
    }

    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (!comparePassword) {
      return res.json({
        error: 'Invalid Credentials',
        success: false,
        status: 400,
      });
    }

    if (findUser.isVerified !== true) {
      //  check if there is token not expired
      const findToken = await Token.findOne({
        userId: findUser._id,
      });

      if (findToken) {
        await verifyEmail(findToken.token, findUser.email, findUser.name);
        return res.json({
          error: 'Please verify your email address',
          success: false,
          status: 400,
        });
      } else {
        // no valid token found so we generate a new one and send to the user to verify his mail
        const token = generateRandomToken();
        const newToken = await new Token({
          userId: findUser._id,
          token,
        }).save();

        await verifyEmail(newToken.token, findUser.email, findUser.name);
        return res.json({
          error: 'Please verify your email',
          status: 400,
          success: false,
        });
      }
    } else {
      // user is verified so we let him sign in
      const token = await generateAccessToken(
        findUser.email,
        findUser._id,
        res
      );

      const { password, ...others } = findUser._doc;

      return res.json({
        message: 'Login successful',
        status: 200,
        success: true,
        user: others,
        token,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    console.log('this is running');
    const token = req.params.token;
    if (!token) {
      return res.json({
        error: 'Token not found',
        status: 404,
        success: false,
      });
    }

    const findToken = await Token.findOne({
      token,
    });
    if (!findToken) {
      return res.json({
        error: 'Token not found',
        success: false,
        status: 404,
      });
    }

    const findUser = await User.findById({
      _id: findToken.userId,
    });

    if (!findUser) {
      return res.json({
        error: 'User not found',
        status: 404,
        success: false,
      });
    }

    findUser.isVerified = true;
    await findUser.save();

    await findToken.deleteOne();

    return res.json({
      message: 'User verified successfully. You can now login',
      status: 200,
      success: true,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const getAllUserExceptLoggedInUser = async (req, res) => {
  try {
    const loggedInUser = req.params.userId;
    const allUsers = await User.find({ _id: { $ne: loggedInUser } }).select(
      '-password'
    );

    if (!allUsers || allUsers.length === 0) {
      return res.json({
        error: 'No user found',
        status: 404,
        success: false,
      });
    }

    return res.json({
      message: 'Users fetched successfully',
      success: true,
      status: 200,
      users: allUsers,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const sendFriendRequest = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;
  try {
    const currentUser = await User.findById({ _id: currentUserId });

    if (currentUser.friends.includes(selectedUserId)) {
      return res.json({
        error: 'You are both friends already',
        success: false,
        status: 400,
      });
    }

    if (currentUser.sentFriendRequest.includes(selectedUserId)) {
      return res.json({
        error: 'friend request already sent to the user',
        status: 400,
        success: false,
      });
    }

    if (currentUser.friendRequest.includes(selectedUserId)) {
      // here accept the friend request by pushing the selectedID to friends and also pushing the currentUserID to friends inside the selectedUser document

      await User.findByIdAndUpdate(
        { _id: currentUserId },
        {
          $push: { friends: selectedUserId },
          $pull: { friendRequest: selectedUserId },
        }
      );

      await User.findByIdAndUpdate(
        { _id: selectedUserId },
        {
          $push: { friends: currentUserId },
          $pull: { sentFriendRequest: currentUserId },
        }
      );

      return res.json({
        message: 'Friend request accepted successfully.',
        status: 200,
        success: true,
      });
    }

    // update the selected user by adding the current user id to it friend request array
    const updateSelectedUser = await User.findByIdAndUpdate(
      { _id: selectedUserId },
      {
        $push: { friendRequest: currentUserId },
      }
    );

    // update the current user by adding the selected user id to the sent friend request array
    const updateCurrentUser = await User.findByIdAndUpdate(
      { _id: currentUserId },
      {
        $push: { sentFriendRequest: selectedUserId },
      }
    );

    if (!updateCurrentUser && !updateSelectedUser) {
      return res.json({
        error: 'Unable to send friend request',
        status: 400,
        success: false,
      });
    } else {
      return res.json({
        message: 'Friend request was successfully sent',
        status: 200,
        success: true,
        selectedUserId,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const showFriendRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // fetch the user document based on ID
    const user = await User.findById({ _id: userId })
      .populate('friendRequest', 'name email image.url')
      .lean();

    if (!user) {
      return res.json({
        error: 'User not found',
        success: false,
        status: 404,
      });
    }

    const friendRequests = user.friendRequest;

    if (!friendRequests || friendRequests.length === 0) {
      return res.json({
        error: 'No friend request found at the moment',
        status: 404,
        success: false,
      });
    }

    return res.json({
      message: 'Friend requests found successfully',
      success: true,
      status: 200,
      friendRequests,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const deleteFriendRequest = async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;
    const currentUser = await User.findById({ _id: currentUserId });
    const selectedUser = await User.findById({ _id: selectedUserId });

    if (currentUser.friendRequest.includes(selectedUserId)) {
      await User.findByIdAndUpdate(
        { _id: currentUserId },
        {
          $pull: { friendRequest: selectedUserId },
        }
      );

      await User.findByIdAndUpdate(
        { _id: selectedUserId },
        {
          $pull: { sentFriendRequest: currentUserId },
        }
      );

      return res.json({
        message: 'Friend request deleted successfully',
        success: true,
        status: 200,
      });
    } else {
      return res.json({
        error: 'This user do not send friend request to you',
        success: false,
        status: 404,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const getFriends = async (req, res) => {
  try {
    console.log('This is the one i want to use now');
    const { userId } = req.params;
    const user = await User.findById({ _id: userId }).populate(
      'friends',
      'name email image.url'
    );

    return res.json({
      message: 'Friends successfully fetched',
      success: true,
      status: 200,
      friends: user.friends,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const getRecipientById = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const recipientDetails = await User.findById({ _id: recipientId });
    if (!recipientDetails) {
      return res.json({
        error: "Couldn't find recipient",
        status: 404,
        success: false,
      });
    }

    const { password, ...others } = recipientDetails._doc;
    return res.json({
      message: 'Recipient fetched successfully',
      status: 200,
      success: true,
      recipient: others,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const sentFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById({ _id: userId })
      .populate('sentFriendRequest', 'name email image')
      .lean();
    if (!user) {
      return res.json({
        error: 'user not found',
        success: false,
        status: 404,
      });
    }

    const sentFriendRequest = user.sentFriendRequest;

    return res.json({
      message: 'we have found the user successfully',
      status: 200,
      success: true,
      sentFriendRequest,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const userFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById({ _id: userId }).populate(
      'friends',
      '_id'
    );

    if (!user) {
      return res.json({
        error: 'Could not find user',
        status: 404,
        success: false,
      });
    }

    const friendIds = user.friends;
    console.log(friendIds);

    return res.json({
      message: 'Friend fetched successfully',
      success: true,
      status: 200,
      friendIds,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log('this is forgot password logic');
    const { email } = req.body;

    if (!email) {
      return res.json({
        error: 'Please provide your email address',
        success: false,
        status: 400,
      });
    }

    const trimmedEmail = email.trim();

    // check the email field to prevent input of unwanted characters
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        status: 400,
        success: false,
      });
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.json({
        error: 'User can not be found',
        status: 404,
        success: false,
      });
    }

    const checkTokenExist = await Token.findOne({ userId: user._id });
    if (checkTokenExist) {
      const passwordReset = await forgotPasswordMail(
        checkTokenExist.token,
        user.email,
        user.name
      );

      if (passwordReset.response) {
        return res.json({
          message: 'Password reset code has been sent to your email address',
          success: true,
          status: 200,
        });
      }
    } else {
      const token = generateRandomToken();
      const newToken = await new Token({
        token,
        userId: user._id,
      }).save();

      const passwordReset = await forgotPasswordMail(
        newToken.token,
        user.email,
        user.name
      );

      if (passwordReset.response) {
        return res.json({
          message: 'Password reset code has been sent to your email address',
          success: true,
          status: 200,
        });
      }
    }
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    console.log('this is reset password logic');
    const { newPassword, confirmNewPassword, token } = req.body;
    if (!newPassword || !confirmNewPassword || !token) {
      return res.json({
        error: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        newPassword
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.json({
        error: 'Password do not match',
        status: 400,
        success: false,
      });
    }

    const getToken = await Token.findOne({
      token,
    });

    if (!getToken) {
      return res.json({
        error: 'Token not found',
        success: false,
        status: 404,
      });
    } else {
      const user = await User.findById({ _id: getToken.userId });
      if (!user) {
        return res.json({
          error: 'User not found',
          success: false,
          status: 404,
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      await getToken.deleteOne();

      return res.json({
        message: 'Password changed successfully, you can now login.',
        success: true,
        status: 200,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

const logoutUser = async (req, res) => {
  try {
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
      message: 'Something went wrong',
    });
  }
};

export {
  forgotPassword,
  resetPassword,
  logoutUser,
  userFriends,
  sentFriendRequest,
  sendFriendRequest,
  registerUser,
  loginUser,
  verifyUser,
  getAllUserExceptLoggedInUser,
  showFriendRequests,
  deleteFriendRequest,
  getFriends,
  getRecipientById,
};
