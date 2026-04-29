const Dog = require("../models/Dog");

// post a new dog
exports.postDog = async (request, response) => {
  console.log("postDog method triggered"); // Log method trigger
  console.log("Request body:", request.body); // Log request body
  console.log("Request user:", request.user); // Log user details

  // Check if the user is an admin
  if (!request.user || request.user.role !== "admin") {
    return response.status(403).json({ error: "Access denied. Admins only." });
  }

  if (!request.body) {
    return response.status(400).json({ error: "Request body is required" });
  }

  const { name, breed, age, owner, photo, notes, addedBy } = request.body;

  if (!name) {
    return response.status(400).json({ error: "Dog name is required" });
  }
  if (!breed) {
    return response.status(400).json({ error: "Dog breed is required" });
  }
  if (!age || age === undefined || age === null) {
    return response.status(400).json({ error: "Dog age is required" });
  }
  if (typeof age !== "number" || age < 0) {
    return response
      .status(400)
      .json({ error: "Dog age must be a positive number" });
  }

  try {
    const newDog = new Dog({
      name,
      breed,
      age,
      owner: owner,
      photo,
      notes,
      addedBy: addedBy || request.user.id, // Default to the current admin user
    });

    const savedDog = await newDog.save();
    console.log("Dog saved successfully:", savedDog); // Log success
    return response.status(201).json(savedDog);
  } catch (error) {
    console.error("Error saving dog:", error.message); // Log error
    return response.status(400).json({ error: error.message });
  }
};

// update a dog's information
exports.putDog = async (request, response) => {
  console.log("putDog method triggered"); // Log method trigger
  console.log("Request body:", request.body); // Log request body
  console.log("Request user:", request.user); // Log user details

  // Check if the user is an admin
  if (!request.user || request.user.role !== "admin") {
    return response.status(403).json({ error: "Access denied. Admins only." });
  }

  const { id } = request.params;
  const { name, breed, age, owner, photo, notes, addedBy } = request.body;

  try {
    const updatedDog = await Dog.findByIdAndUpdate(
      id,
      { name, breed, age, owner, photo, notes, addedBy },
      { new: true, runValidators: true },
    );

    if (!updatedDog) {
      return response.status(404).json({ error: "Dog not found" });
    }

    console.log("Dog updated successfully:", updatedDog); // Log success
    return response.status(200).json(updatedDog);
  } catch (error) {
    console.error("Error updating dog:", error.message); // Log error
    return response.status(400).json({ error: error.message });
  }
};
