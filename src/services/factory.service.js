const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Creates a new document in the specified model.
 *
 * @param {Object} Model - The Mongoose model to create the document in.
 * @param {Object} docBody - The data to create the document with.
 * @returns {Promise<Object>} The created document.
 */
const createOne = async (Model, docBody) => {
  const doc = await Model.create(docBody);
  return doc;
};

/**
 * Queries all documents from a given model based on the provided filter and options.
 *
 * @param {Object} Model - The Mongoose model to query.
 * @param {Object} filter - The filter criteria for querying documents.
 * @param {Object} options - The options for pagination and other query settings.
 * @returns {Promise<Object>} - A promise that resolves to the queried documents.
 */
const queryAll = async (Model, filter, options) => {
  const docs = await Model.paginate(filter, options);
  return docs;
};

/**
 * Retrieves a document by its ID from the specified model, with optional population of related documents.
 *
 * @param {mongoose.Model} Model - The Mongoose model to query.
 * @param {mongoose.Types.ObjectId | string} id - The ID of the document to retrieve.
 * @param {string | Object} [popOptions] - Optional population options to populate related documents.
 * @returns {Promise<mongoose.Document>} - A promise that resolves to the retrieved document.
 * @throws {ApiError} - Throws an error if the document is not found.
 */
const getDocById = async (Model, id, popOptions) => {
  let query = await Model.findById(id);
  if (popOptions) query = query.populate(popOptions);
  const doc = await query;

  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `${Model.modelName} not found`);
  return doc;
};

/**
 * Retrieves a single document from the database based on the provided model and parameter.
 *
 * @param {Object} Model - The Mongoose model to query.
 * @param {string} param - The parameter to use for querying the document. This can be an ID or another query parameter.
 * @returns {Promise<Object>} - A promise that resolves to the retrieved document.
 * @throws {ApiError} - Throws an error if the document is not found.
 */
const getOne = async (Model, param) => {
  // let { query } = param === 'req.params.attractionId' ? Model.findById(param) : Model.findOne({ param });

  const doc = await getDocById(Model, param);
  // const doc = await query;

  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `Document with ID: ${param} not found`);

  // if (popOptions) query = query.populate(popOptions);
  return doc;
};

/**
 * Retrieves a document by its slug from the specified model.
 *
 * @param {Object} Model - The Mongoose model to query.
 * @param {string} slug - The slug to search for in the model.
 * @param {Object} [popOptions] - Optional population options for the query.
 * @returns {Promise<Object>} - The document found by the query.
 * @throws {ApiError} - Throws an error if the document is not found.
 */
const getDocBySlug = async (Model, slug, popOptions) => {
  let query = await Model.findOne({ slug });
  if (popOptions) query = query.populate(popOptions);
  if (!query) throw new ApiError(httpStatus.NOT_FOUND, `${Model.modelName} not found`);
  return query;
};

/**
 * Retrieves a document from the database by email.
 *
 * @param {Object} Model - The Mongoose model to query.
 * @param {string} email - The email to search for.
 * @returns {Promise<Object>} The document found.
 * @throws {ApiError} If no document is found with the given email.
 */
const getDocByEmail = async (Model, email) => {
  const doc = await Model.findOne({ email });
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `${Model.modelName} not found`);
  return doc;
};

/**
 * Updates a document by its ID.
 *
 * @param {Model} Model - The Mongoose model to use for the update.
 * @param {string} docId - The ID of the document to update.
 * @param {Object} updateBody - The data to update the document with.
 * @returns {Promise<Object>} The updated document.
 * @throws {ApiError} If the document is not found or if the email is already taken.
 */
const updateDocById = async (Model, docId, updateBody) => {
  const doc = await getDocById(Model, docId);

  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `${Model.modelName} not found`);

  if (updateBody.email && (await Model.isEmailTaken(updateBody.email, docId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  Object.assign(doc, updateBody);
  await doc.save();
  return doc;
};

/**
 * Updates a document in the database.
 *
 * @param {Model} Model - The Mongoose model to use for the update.
 * @param {string} docId - The ID of the document to update.
 * @param {Object} updateBody - The fields to update in the document.
 * @returns {Promise<Object>} The updated document.
 * @throws {ApiError} If the document is not found or if the email is already taken.
 */
const updateDoc = async (Model, docId, updateBody) => {
  const doc = await Model.findByIdAndUpdate(docId, { $set: updateBody }, { new: true, runValidators: true }).select('-__v');

  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `${Model.modelName} not found`);
  if (updateBody.email && (await Model.isEmailTaken(updateBody.email, docId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return doc;
};

/**
 * Deletes a document by its ID.
 *
 * @param {Object} Model - The Mongoose model to use for the query.
 * @param {string} docId - The ID of the document to delete.
 * @returns {Promise<Object>} The deleted document.
 * @throws {ApiError} If the document is not found.
 */
const deleteDocById = async (Model, docId) => {
  const doc = await getDocById(Model, docId);
  if (!doc) throw new ApiError(httpStatus.NOT_FOUND, `${Model.modelName} not found`);

  await doc.deleteOne();
  return doc;
};

module.exports = {
  createOne,
  queryAll,
  getDocById,
  getOne,
  getDocBySlug,
  getDocByEmail,
  updateDocById,
  updateDoc,
  deleteDocById,
};
