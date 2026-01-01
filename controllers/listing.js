const Listing = require("../models/listing.js");

/* =========================
   INDEX – Show all listings
========================= */
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

/* =========================
   NEW – Render new form
========================= */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

/* =========================
   SHOW – Show single listing
========================= */
module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  // 🔥 FIX: return added
  if (!listing) {
    req.flash("error", "Listing you are requested for does not exist.");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

/* =========================
   CREATE – Create listing
========================= */
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;     // ✅ owner saved
  newListing.image = { url, filename };

  await newListing.save();

  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

/* =========================
   EDIT – Render edit form
========================= */
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you are requested for does not exist.");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

/* =========================
   UPDATE – Update listing
========================= */
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

/* =========================
   DELETE – Delete listing
========================= */
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
