import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      password,
      phone,
      city,
      postcode,
      country,
      state,
      address,
      answer,
      role,
    } = req.body;

    // console.log(req.body);

    if (!fname) {
      return res.send({ message: "First Name is Required" });
    }
    if (!lname) {
      return res.send({ message: "Last Name is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    // if (!phone) {
    //   return res.send({ message: "Phone is Required" });
    // }
    // if (!city) {
    //   return res.send({ message: "City is Required" });
    // }
    // if (!postcode) {
    //   return res.send({ message: "Postcode is Required" });
    // }
    // if (!country) {
    //   return res.send({ message: "Country is Required" });
    // }
    // if (!state) {
    //   return res.send({ message: "State is Required" });
    // }
    // if (!address) {
    //   return res.send({ message: "Address is Required" });
    // }
    // if (!answer) {
    //   return res.send({ message: "Answer is Required" });
    // }
    // if (!role) {
    //   return res.send({ message: "Role is Required" });
    // }

    //Check User
    const existingUser = await userModel.findOne({ email });
    //Existing User
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered Please Login",
      });
    }

    const hashedPassword = await hashPassword(password);

    //save
    const user = await new userModel({
      fname,
      lname,
      email,
      password: hashedPassword,
      phone,
      city,
      postcode,
      country,
      state,
      address,
      answer,
      role,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};

// POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    //Check User
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not Registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    //Token
    //Things we are passing
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        phone: user.phone,
        city: user.city,
        country: user.country,
        state: user.state,
        address: user.address,
        postcode: user.postcode,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

// Forgot Password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }

    // Checking Email & Answer are correct or not

    const user = await userModel.findOne({ email, answer });
    //Validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }

    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.state(500).send({
      success: false,
      message: "Something Went Wrong",
      error,
    });
  }
};

// Test Controller

export const testController = (req, res) => {
  res.send("Protected Route");
};

// Update Profile

export const updateProfileController = async (req, res) => {
  try {
    const {
      fname,
      lname,
      password,
      phone,
      city,
      country,
      state,
      address,
      postcode,
    } = req.body;

    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        fname: fname || user.fname,
        lname: lname || user.lname,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        city: city || user.city,
        country: country || user.country,
        state: state || user.state,
        address: address || user.address,
        postcode: postcode || user.postcode,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while Update profile",
      error,
    });
  }
};

// Orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "fname");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting Orders for User",
      error,
    });
  }
};

// Get All Orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

// Order Status Update
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ); // Status Change
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
