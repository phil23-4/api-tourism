const sharp = require('sharp');
const catchAsync = require('./catchAsync');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize({
      width: 250,
      height: 250,
      kernel: sharp.kernel.nearest,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/assets/img/users/${req.file.filename}`);

  next();
});

exports.resizeCoverPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `destination-${req.params.destinationId}-${Date.now()}-cover.jpeg`;

  await sharp(req.file.buffer)
    .resize({
      width: 2000,
      height: 1333,
      kernel: sharp.kernel.nearest,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/assets/img/destinations/${req.file.filename}`);

  next();
});

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.mainImage || !req.files.images) return next();

  // 1) Cover image
  req.body.mainImage = `tour-${req.params.attractionId}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.mainImage[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/assets/img/tours/${req.body.mainImage}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.tourId}-${Date.now()}-${i + 1}.webp`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('webp')
        .webp({ quality: 80 })
        .toFile(`src/public/assets/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.resizeAttractionCover = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `attraction-${req.params.attractionId}-${Date.now()}-cover.jpeg`;

  await sharp(req.file.buffer)
    .resize({
      width: 2000,
      height: 1333,
      kernel: sharp.kernel.nearest,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/assets/img/attractions/${req.file.filename}`);

  next();
});

exports.resizeAttractionImages = catchAsync(async (req, res, next) => {
  if (!req.files.mainImage || !req.files.images) return next();

  // 1) Cover image
  req.body.mainImage = `tour-${req.params.attractionId}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.mainImage[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/public/assets/img/attractions/${req.body.mainImage}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `attraction-${req.params.attractionId}-${Date.now()}-${i + 1}.webp`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('webp')
        .webp({ quality: 80 })
        .toFile(`src/public/assets/img/attractions/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
