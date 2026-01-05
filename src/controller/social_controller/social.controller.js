const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { uploadFileToS3 } = require("../../service/common/s3.service");
const { getblock } = require("../../service/repository/Block.service");
const { getComment } = require("../../service/repository/Comment.service");
const { isFollow } = require("../../service/repository/Follow.service");
const { getHashTags, createHashtag, updateHashtag, extractHashtags } = require("../../service/repository/hashtag.service");
const { getLike } = require("../../service/repository/Like.service");
const { createMedia } = require("../../service/repository/Media.service");
const { updateMusic, getMusic } = require("../../service/repository/Music.service");
const { deleteNotification } = require("../../service/repository/notification.service");
const { getSave } = require("../../service/repository/Save.service");
const { createSocial, getSocial, deleteSocial, updateSocial, getFollowerSocials } = require("../../service/repository/SocialMedia.service");
const { getUser, updateUser } = require("../../service/repository/user.service");
const { Op, Sequelize } = require('sequelize');
const { getGlobalFrequency } = require("../../service/repository/adFrequency.service");
const { getAds } = require("../../service/repository/ad.service");

// IMPORT TEST
console.log("AD SERVICES IMPORTED: getGlobalFrequency & getAds functions loaded");

(async () => {
  try {
    const freq = await getGlobalFrequency();
    console.log("getGlobalFrequency →", freq?.frequency || "NOT SET (default 5)");
    const ads = await getAds(
      {
        is_active: true,
        deleted_at: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: new Date() }] }
      },
      { page: 1, pageSize: 10 }
    );
    console.log("getAds →", ads.Records?.length || 0, "active ads");
    ads.Records?.forEach(ad => {
      const inIndia = ad.target_countries ? JSON.parse(ad.target_countries).includes("IN") : true;
      console.log(` AD #${ad.id}: "${ad.title}" | IN: ${inIndia} | Active: ${ad.is_active}`);
    });
  } catch (err) {
    console.error("AD SERVICES TEST FAILED →", err.message);
  }
})();

// FORMAT AD AS REEL (FULL COMPATIBILITY)
function formatAdAsSocial(ad) {
  return {
    id: ad.id,                    // ← Frontend expects 'id' not 'ad_id'
    is_ad: true,                  // ← This should be true for ads
    title: ad.title,
    user: 'Sponsored',           // ← Frontend expects 'user' field
    // Keep all other backend fields for compatibility
    ad_id: ad.id,
    social_id: `ad_${ad.id}`,
    social_type: "reel",
    target_url: ad.target_url,
    media_url: ad.media_url,
    social_desc: ad.description || ad.title,
    sub_description: ad.sub_description,
    type: ad.type,
    user_id: null,
    total_likes: 0,
    total_comments: 0,
    total_saves: 0,
    total_views: 0,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    createdAt: ad.created_at,
    updatedAt: ad.updated_at,
    User: {
      user_id: null,
      user_name: "Sponsored",
      profile_pic: "https://yourdomain.com/images/ad-profile.png"
    },
    Media: [{
      media_location: ad.media_url
    }],
    reel_thumbnail: ad.media_url,
    aspect_ratio: "9:16",
    video_hight: 1920
  };
}

// UPLOAD SOCIAL
async function uploadSocial(req, res) {
  try {
    const social_type = req.body.social_type;
    const user_id = req.authData.user_id;
    let post_media, media_location;

    if (process.env.MEDIAFLOW === "S3") {
      if (!req.body.file_media_1) return generalResponse(res, {}, "File Data is missing", false, true, 404);
      post_media = req.body.file_media_1;
      if (social_type === "reel" && !req.body.file_media_2) return generalResponse(res, {}, "File Data is missing", false, true, 404);
      media_location = req.body.file_media_2;
    } else {
      post_media = req.files[0].path;
      if (social_type === "reel") media_location = req.files[1].path;
    }

    const allowedUpdateFieldsMandatory = ['social_desc', 'social_type', 'location', 'taged', 'files', 'aspect_ratio', 'video_hight', 'music_id'];
    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, allowedUpdateFieldsMandatory);
      filteredData.user_id = user_id;
    } catch (err) {
      return generalResponse(res, { success: false }, "Data is Missing", false, true);
    }

    const isUser = await getUser(filteredData);
    if (!isUser) return generalResponse(res, {}, "User not found", false, true, 404);
    filteredData.country = isUser.country;

    if (filteredData.social_desc) {
      filteredData.hashtag = extractHashtags(filteredData.social_desc);
      if (filteredData.hashtag?.length > 0) {
        filteredData.hashtag.forEach(async (hashtag) => {
          const isHashtag = await getHashTags({ hashtag_name: hashtag });
          if (isHashtag.Records.length === 0) {
            await createHashtag({ hashtag_name: hashtag, counts: 1 });
          } else {
            await updateHashtag({ counts: isHashtag.Records[0].counts + 1 }, { hashtag_name: isHashtag.Records[0].hashtag_name });
          }
        });
      }
    }

    if (social_type === 'post') {
      const post = await createSocial(filteredData);
      if (!post) return generalResponse(res, {}, "Failed to Upload post", false, true);

      const mediaPromises = req.files.map(file => createMedia({ social_id: post.social_id, media_location: file.path }));
      const mediaResults = await Promise.all(mediaPromises);
      await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id });

      return mediaResults ? generalResponse(res, {}, "Post Uploaded Successfully", true, true)
                          : generalResponse(res, {}, "Failed to Upload post", false, true);
    }

    if (social_type === 'reel') {
      filteredData.reel_thumbnail = post_media;
      const reel = await createSocial(filteredData);
      if (!reel) return generalResponse(res, {}, "Failed to Upload post", false, true);

      await createMedia({ social_id: reel.social_id, media_location });
      await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id });

      if (reel.music_id) {
        const music = await getMusic({ music_id: reel.music_id });
        if (music.Pagination.total_records > 0) {
          await updateMusic({ total_use: music.Records[0].total_use + 1 });
        }
      }
      return generalResponse(res, {}, "Reel Uploaded Successfully", true, true);
    }

    return generalResponse(res, {}, "Invalid social type", false, true);
  } catch (error) {
    console.error("Error in uploading social", error);
    return generalResponse(res, { success: false }, "Something went wrong while uploading social!", false, true);
  }
}





async function uploadMediaS3(req, res) {
    try {
        const file = req.body
        if (!file.originalname && !file.mimetype) {
            return generalResponse(
                res,
                {},
                "File Data is missing",
                false,
                true,
                404
            );
        }
        const url = await uploadFileToS3(file);
        if (url) {
            return generalResponse(
                res,
                { url: url },
                "File Uploaded Successfully",
                true,
                true
            );
        } else {
            return generalResponse(
                res,
                {},
                "Failed to Upload File",
                false,
                true
            );
        }


    } catch (error) {
        console.error("Error in uploading file in s3", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while uploading file in s3!",
            false,
            true
        );
    }
}

// GET SOCIALS OF FOLLOWERS
async function getSocialsOfFollowers(req, res) {
  try {
    const user_id = req.authData.user_id;
    const { page = 1, pageSize = 10 } = req.body;

    const followerSocials = await getFollowerSocials({ follower_id: user_id }, { page, pageSize });

    if (!followerSocials?.Records?.length) {
      return generalResponse(res, { Records: [], Pagination: {} }, "No follower socials", true, true);
    }

    return generalResponse(res, followerSocials, "Follower socials found", true, false);
  } catch (error) {
    console.error("Error in getSocialsOfFollowers:", error);
    return generalResponse(res, {}, "Something went wrong", false, true);
  }
}

// const GLOBAL_SHUFFLE_SEED = "GLOBAL_AD_SHUFFLE";
// async function showSocials(req, res) {
//   try {
//     const user_id = req.authData.user_id;
//     let { page = 1, pageSize = 10, order = [['createdAt', 'DESC']] } = req.body;

//     page = Number(page);
//     pageSize = Number(pageSize);

//     let filteredData;
//     try {
//       filteredData = updateFieldsFilter(req.body, [
//         'social_id','social_type','country',
//         'location','taged','user_id',
//         'hashtag','music_id'
//       ]);
//       filteredData.status = true;
//       filteredData.deleted_by_user = false;
//     } catch {
//       filteredData = { status: true, deleted_by_user: false };
//     }

//     const socials = await getSocial(
//       filteredData,
//       { page, pageSize },
//       [],
//       order === "random" ? Sequelize.literal('RANDOM()') : order
//     );

//     if (!socials?.Records?.length) {
//       return generalResponse(res, { Records: [], Pagination: socials.Pagination }, "No reels", true, true);
//     }

//     const frequency = Math.max(1, (await getGlobalFrequency())?.frequency || 4);

//     const adsRes = await getAds(
//       { is_active: true, deleted_at: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: new Date() }] } },
//       { page: 1, pageSize: 100 },
//       [],
//       [['position', 'ASC']]
//     );

//     const adPool = adsRes?.Records || [];
//     const fixedAd = adPool.find(a => a.position === 1) || null;
//     const randomAds = adPool.filter(a => a.position !== 1);

//     // 🔥 STATIC SEED (no user, no date)
//     const bag = seededShuffle(randomAds, "GLOBAL_AD_SHUFFLE");
//     const totalAds = bag.length;

//     const reelsBefore = (page - 1) * pageSize;
//     let adsAlreadyShown = Math.floor(reelsBefore / frequency);
//     let bagIndex = totalAds ? adsAlreadyShown % totalAds : 0;

//     const finalFeed = [];

//     // Fixed ad only on first page
//     if (page === 1 && fixedAd) {
//       finalFeed.push(formatAdAsSocial(fixedAd));
//     }

//     let reelsRendered = 0;

//     socials.Records.forEach(reel => {
//       finalFeed.push(reel);
//       reelsRendered++;

//       if (reelsRendered % frequency === 0 && totalAds > 0) {
//         const ad = bag[bagIndex];
//         bagIndex = (bagIndex + 1) % totalAds;
//         finalFeed.push(formatAdAsSocial(ad));
//       }
//     });

//     return generalResponse(
//       res,
//       { Records: finalFeed, Pagination: socials.Pagination },
//       "Feed loaded",
//       true,
//       false
//     );

//   } catch (err) {
//     console.error(err);
//     return generalResponse(res, {}, "Something went wrong", false, true);
//   }
// }
// async function showSocialswithoutauth(req, res) {
//   try {
//     let { page = 1, pageSize = 10, order = [['createdAt', 'DESC']] } = req.body;

//     page = Number(page);
//     pageSize = Number(pageSize);

//     let filteredData;
//     try {
//       filteredData = updateFieldsFilter(req.body, [
//         'social_id','social_type','country',
//         'location','taged','user_id',
//         'hashtag','music_id'
//       ]);
//       filteredData.status = true;
//       filteredData.deleted_by_user = false;
//     } catch {
//       filteredData = { status: true, deleted_by_user: false };
//     }

//     const socials = await getSocial(
//       filteredData,
//       { page, pageSize },
//       [],
//       order === "random" ? Sequelize.literal('RANDOM()') : order
//     );

//     if (!socials?.Records?.length) {
//       return generalResponse(
//         res,
//         { Records: [], Pagination: socials.Pagination },
//         "No reels",
//         true,
//         true
//       );
//     }

//     const frequency = Math.max(1, (await getGlobalFrequency())?.frequency || 4);

//     const adsRes = await getAds(
//       {
//         is_active: true,
//         deleted_at: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: new Date() }] }
//       },
//       { page: 1, pageSize: 100 },
//       [],
//       [['position', 'ASC']]
//     );

//     const adPool = adsRes?.Records || [];
//     const fixedAd = adPool.find(a => a.position === 1) || null;
//     const randomAds = adPool.filter(a => a.position !== 1);

//     const bag = seededShuffle(randomAds, "GLOBAL_AD_SHUFFLE");
//     const totalAds = bag.length;

//     const reelsBefore = (page - 1) * pageSize;
//     let adsAlreadyShown = Math.floor(reelsBefore / frequency);
//     let bagIndex = totalAds ? adsAlreadyShown % totalAds : 0;

//     const finalFeed = [];

//     // ✅ fixed ad only on page 1
//     if (page === 1 && fixedAd) {
//       finalFeed.push(formatAdAsSocial(fixedAd));
//     }

//     let reelsRendered = 0;

//     socials.Records.forEach(reel => {
//       finalFeed.push(reel);
//       reelsRendered++;

//       if (reelsRendered % frequency === 0 && totalAds > 0) {
//         const ad = bag[bagIndex];
//         bagIndex = (bagIndex + 1) % totalAds;
//         finalFeed.push(formatAdAsSocial(ad));
//       }
//     });

//     return generalResponse(
//       res,
//       { Records: finalFeed, Pagination: socials.Pagination },
//       "Public feed loaded",
//       true,
//       false
//     );

//   } catch (err) {
//     console.error("showSocialswithoutauth error:", err);
//     return generalResponse(res, {}, "Something went wrong", false, true);
//   }
// }
function shuffleArray(arr) {
  const result = [...arr]; // original array safe

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


function buildFeed({
  reels,
  page,
  pageSize,
  frequency,
  fixedAd,
  randomAds
}) {
  const finalFeed = [];

const shuffledAds = shuffleArray(randomAds);
  const totalAds = shuffledAds.length;

  // 🔢 Total reels rendered before this page
  let reelsBefore = (page - 1) * pageSize;

  // 🧮 Ads already injected before this page
  let adsShownBefore = Math.floor(reelsBefore / frequency);
  let adIndex = totalAds ? adsShownBefore % totalAds : 0;

  // 🎯 Fixed ad only on page 1
  if (page === 1 && fixedAd) {
    finalFeed.push(formatAdAsSocial(fixedAd));
  }

  // 📌 How many reels already used in current frequency cycle
  let reelsInCurrentBlock = reelsBefore % frequency;

  for (const reel of reels) {
    finalFeed.push(reel);
    reelsInCurrentBlock++;

    if (reelsInCurrentBlock === frequency && totalAds > 0) {
      finalFeed.push(formatAdAsSocial(shuffledAds[adIndex]));
      adIndex = (adIndex + 1) % totalAds;
      reelsInCurrentBlock = 0;
    }
  }

  return finalFeed;
}
async function showSocials(req, res) {
  try {
    let { page = 1, pageSize = 10, order = [['createdAt', 'DESC']] } = req.body;

    page = Number(page);
    pageSize = Number(pageSize);

    let filteredData = updateFieldsFilter(req.body, [
      'social_id','social_type','country',
      'location','taged','user_id',
      'hashtag','music_id'
    ]);

    filteredData.status = true;
    filteredData.deleted_by_user = false;

    const socials = await getSocial(
      filteredData,
      { page, pageSize },
      [],
      order === "random" ? Sequelize.literal('RANDOM()') : order
    );

    if (!socials?.Records?.length) {
      return generalResponse(res, socials, "No reels", true, true);
    }

    const frequency = Math.max(1, (await getGlobalFrequency())?.frequency || 4);

    const adsRes = await getAds(
      { is_active: true, deleted_at: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: new Date() }] } },
      { page: 1, pageSize: 100 },
      [],
      [['position', 'ASC']]
    );

    const ads = adsRes?.Records || [];
    const fixedAd = ads.find(a => a.position === 1) || null;
    const randomAds = ads.filter(a => a.position !== 1);

    const feed = buildFeed({
      reels: socials.Records,
      page,
      pageSize,
      frequency,
      fixedAd,
      randomAds
    });

    return generalResponse(
      res,
      { Records: feed, Pagination: socials.Pagination },
      "Feed loaded",
      true,
      false
    );

  } catch (err) {
    console.error(err);
    return generalResponse(res, {}, "Something went wrong", false, true);
  }
}
async function showSocialswithoutauth(req, res) {
  try {
    let { page = 1, pageSize = 10, order = [['createdAt', 'DESC']] } = req.body;

    page = Number(page);
    pageSize = Number(pageSize);

    let filteredData = updateFieldsFilter(req.body, [
      'social_id','social_type','country',
      'location','taged','user_id',
      'hashtag','music_id'
    ]);

    filteredData.status = true;
    filteredData.deleted_by_user = false;

    const socials = await getSocial(
      filteredData,
      { page, pageSize },
      [],
      order === "random" ? Sequelize.literal('RANDOM()') : order
    );

    if (!socials?.Records?.length) {
      return generalResponse(res, socials, "No reels", true, true);
    }

    const frequency = Math.max(1, (await getGlobalFrequency())?.frequency || 4);

    const adsRes = await getAds(
      { is_active: true, deleted_at: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: new Date() }] } },
      { page: 1, pageSize: 100 },
      [],
      [['position', 'ASC']]
    );

    const ads = adsRes?.Records || [];
    const fixedAd = ads.find(a => a.position === 1) || null;
    const randomAds = ads.filter(a => a.position !== 1);

    const feed = buildFeed({
      reels: socials.Records,
      page,
      pageSize,
      frequency,
      fixedAd,
      randomAds
    });

    return generalResponse(
      res,
      { Records: feed, Pagination: socials.Pagination },
      "Public feed loaded",
      true,
      false
    );

  } catch (err) {
    console.error(err);
    return generalResponse(res, {}, "Something went wrong", false, true);
  }
}



async function showSocialsAdmin(req, res) {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const socials = await getSocial({}, { page, pageSize }, [], [['createdAt', 'DESC']]);

    return generalResponse(res, socials, "Admin socials", true, false);
  } catch (error) {
    console.error("Error in showSocialsAdmin:", error);
    return generalResponse(res, {}, "Failed", false, true);
  }
}

// UPDATE SOCIALS ADMIN
async function updateSocialsAdmin(req, res) {
  try {
    const { social_id } = req.body;
    const updateData = updateFieldsFilter(req.body, ['social_desc', 'status', 'deleted_by_user']);
    const result = await updateSocial(updateData, { social_id });

    return result ? generalResponse(res, {}, "Updated", true, true)
                  : generalResponse(res, {}, "Failed", false, true);
  } catch (error) {
    console.error("Error in updateSocialsAdmin:", error);
    return generalResponse(res, {}, "Failed", false, true);
  }
}

// ADD VIEWS
async function addViews(req, res) {
  try {
    const { social_id } = req.body;
    const social = await getSocial({ social_id });
    if (!social?.Records?.length) return generalResponse(res, {}, "Not found", false, true, 404);

    await updateSocial({ total_views: social.Records[0].total_views + 1 }, { social_id });
    return generalResponse(res, {}, "View added", true, true);
  } catch (error) {
    console.error("Error in addViews:", error);
    return generalResponse(res, {}, "Failed", false, true);
  }
}

// DELETE SOCIALS
async function deleteSocials(req, res) {
  try {
    const { social_id } = req.body;
    const user_id = req.authData.user_id;

    const social = await getSocial({ social_id, user_id });
    if (!social?.Records?.length) return generalResponse(res, {}, "Not found or unauthorized", false, true, 404);

    await deleteSocial({ social_id });
    await deleteNotification({ social_id });

    return generalResponse(res, {}, "Deleted", true, true);
  } catch (error) {
    console.error("Error in deleteSocials:", error);
    return generalResponse(res, {}, "Failed", false, true);
  }
}

// EDIT SOCIAL
async function editSocial(req, res) {
  try {
    const { social_id, social_desc } = req.body;
    const user_id = req.authData.user_id;

    const social = await getSocial({ social_id, user_id });
    if (!social?.Records?.length) return generalResponse(res, {}, "Not found or unauthorized", false, true, 404);

    const updateData = { social_desc };
    if (social_desc) {
      updateData.hashtag = extractHashtags(social_desc);
    }

    await updateSocial(updateData, { social_id });
    return generalResponse(res, {}, "Edited", true, true);
  } catch (error) {
    console.error("Error in editSocial:", error);
    return generalResponse(res, {}, "Failed", false, true);
  }
}
async function getReels(req, res) {
  try {
    const tokenUser = req.authData?.user_id || null;

    let { page = 1, pageSize = 10, order = [['createdAt', 'DESC']] } = req.body;
    page = Number(page);
    pageSize = Number(pageSize);

    const allowedUpdateFields = [
      'social_id',
      'social_type',
      'country',
      'location',
      'taged',
      'user_id',
      'hashtag',
      'music_id'
    ];

    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
      filteredData.status = true;
      filteredData.deleted_by_user = false;
    } catch {
      return generalResponse(res, {}, "Data is Missing", false, true);
    }

    // 🔹 Blocked users only if logged in
    let excludedUserIds = [];
    if (tokenUser) {
      const blocked = new Set();
      const block1 = await getblock({ user_id: tokenUser });
      const block2 = await getblock({ blocked_id: tokenUser });

      block1?.Records?.forEach(b => blocked.add(b.blocked_id));
      block2?.Records?.forEach(b => blocked.add(b.user_id));

      excludedUserIds = Array.from(blocked);
    }

    const socials = await getSocial(
      filteredData,
      { page, pageSize },
      excludedUserIds,
      order === "random" ? Sequelize.literal('RANDOM()') : order
    );

    if (!socials?.Records?.length) {
      return generalResponse(
        res,
        { Records: [], Pagination: socials.Pagination },
        "No reels found",
        true,
        true
      );
    }

    // 🔹 Enrichment
    let likedIds = new Set();
    let savedIds = new Set();

    if (tokenUser) {
      likedIds = new Set((await getLike({ like_by: tokenUser })).Records.map(l => l.social_id));
      savedIds = new Set((await getSave({ save_by: tokenUser })).Records.map(s => s.social_id));
    }

    const enriched = await Promise.all(
      socials.Records.map(async item => {
        const r = JSON.parse(JSON.stringify(item));

        const [comments, likes, saves, follow] = await Promise.all([
          getComment({ social_id: r.social_id }),
          getLike({ social_id: r.social_id }),
          getSave({ social_id: r.social_id }),
          tokenUser ? isFollow({ follower_id: tokenUser, user_id: r.user_id }) : null
        ]);

        r.total_comments = comments.Pagination.total_records;
        r.total_likes = likes.Pagination.total_records;
        r.total_saves = saves.Pagination.total_records;
        r.isLiked = tokenUser ? likedIds.has(r.social_id) : false;
        r.isSaved = tokenUser ? savedIds.has(r.social_id) : false;
        r.isFollowing = follow?.Records?.length > 0;
        r.is_ad = false;

        return r;
      })
    );

    return generalResponse(
      res,
      { Records: enriched, Pagination: socials.Pagination },
      "Reels loaded successfully",
      true,
      false
    );

  } catch (err) {
    console.error(err);
    return generalResponse(res, {}, "Something went wrong", false, true);
  }
}


function seededShuffle(array, seed) {
  const result = [...array];
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let i = result.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

async function getAdsFeed(req, res) {
  try {
    let { page = 1, pageSize = 10 } = req.body;
    page = Number(page);
    pageSize = Number(pageSize);

    const frequency = Math.max(1, (await getGlobalFrequency())?.frequency || 4);

    const adsRes = await getAds(
      {
        is_active: true,
        deleted_at: { [Op.or]: [{ [Op.is]: null }, { [Op.gt]: new Date() }] }
      },
      { page: 1, pageSize: 200 },
      [],
      [['position', 'ASC']]
    );

    const adPool = adsRes?.Records || [];

    const fixedAd = adPool.find(a => a.position === 1) || null;
    const randomAds = adPool.filter(a => a.position !== 1);

    const SHUFFLE_SEED = "GLOBAL_AD_SHUFFLE_V1";
    const shuffledAds = seededShuffle(randomAds, SHUFFLE_SEED);

    const totalAds = shuffledAds.length;
    const reelsBefore = (page - 1) * pageSize;
    let adPointer = Math.floor(reelsBefore / frequency) % (totalAds || 1);

    const ads = [];

    // 🔹 First ad only on page 1
    if (page === 1 && fixedAd) {
      ads.push(formatAdAsSocial(fixedAd));
    }

    for (let i = 0; i < pageSize; i++) {
      if ((reelsBefore + i + 1) % frequency === 0 && totalAds) {
        ads.push(formatAdAsSocial(shuffledAds[adPointer]));
        adPointer = (adPointer + 1) % totalAds;
      }
    }

    return generalResponse(
      res,
      { Records: ads },
      "Ads loaded successfully",
      true,
      false
    );

  } catch (err) {
    console.error(err);
    return generalResponse(res, {}, "Something went wrong", false, true);
  }
}

module.exports = {
  uploadSocial,
  showSocials,
  deleteSocials,
  addViews,
  showSocialsAdmin,
  updateSocialsAdmin,
  uploadMediaS3,
  editSocial,
  showSocialswithoutauth,
  getSocialsOfFollowers,
getReels,
getAdsFeed
};  





















// const { generalResponse } = require("../../helper/response.helper");
// const updateFieldsFilter = require("../../helper/updateField.helper");
// const { uploadFileToS3 } = require("../../service/common/s3.service");
// const { getblock } = require("../../service/repository/Block.service");
// const { getComment } = require("../../service/repository/Comment.service");
// const { isFollow } = require("../../service/repository/Follow.service");
// const { getHashTags, createHashtag, updateHashtag, extractHashtags } = require("../../service/repository/hashtag.service");
// const { getLike } = require("../../service/repository/Like.service");
// const { createMedia } = require("../../service/repository/Media.service");
// const { updateMusic, getMusic } = require("../../service/repository/Music.service");
// const { deleteNotification } = require("../../service/repository/notification.service");
// const { getSave } = require("../../service/repository/Save.service");
// const { createSocial, getSocial, deleteSocial, updateSocial, getFollowerSocials } = require("../../service/repository/SocialMedia.service");
// const { getUser, updateUser } = require("../../service/repository/user.service");
// const { Op, Sequelize } = require('sequelize');

// async function uploadSocial(req, res) {
//     try {
//         const social_type = req.body.social_type
//         const user_id = req.authData.user_id

//         let allowedUpdateFieldsMandatory = [];
//         let allowedUpdateFields = [];
//         let post_media
//         if (process.env.MEDIAFLOW == "S3") {
//             if (!req.body.file_media_1) {
//                 return generalResponse(
//                     res,
//                     {},
//                     "File Data is missing",
//                     false,
//                     true,
//                     404
//                 );
//             }

//             post_media = req.body.file_media_1
//         }
//         else {

//             post_media = req.files[0].path
//         }
//         let media_location
//         if (social_type == "reel") {
//             if (process.env.MEDIAFLOW == "S3") {
//                 if (!req.body.file_media_2) {
//                     return generalResponse(
//                         res,
//                         {},
//                         "File Data is missing",
//                         false,
//                         true,
//                         404
//                     );
//                 }

//                 media_location = req.body.file_media_2
//             }
//             else {
//                 media_location = req.files[1].path

//             }
//         }
//         allowedUpdateFieldsMandatory = ['social_desc', 'social_type', 'location', 'taged', 'files', 'aspect_ratio', 'video_hight', 'music_id']
//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFieldsMandatory);
//             filteredData.user_id = user_id
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }
//         const isUser = await getUser(filteredData)

//         if (!isUser) {
//             // return generalResponse(
//             //     res, req.files[1].path

//             // )
//         }
//         filteredData.country = isUser.country
//         if (filteredData.social_desc) {
//             filteredData.hashtag = extractHashtags(filteredData.social_desc);
//         }
//         if (filteredData?.hashtag || filteredData?.hashtag?.length > 0) {
//             filteredData.hashtag.forEach(async (hashtag) => {
//                 const isHashtag = await getHashTags({ hashtag_name: hashtag })

//                 if (isHashtag.Records.length <= 0) {
//                     await createHashtag({ hashtag_name: hashtag, counts: 1 })
//                 }
//                 else {

//                     await updateHashtag({ counts: isHashtag.Records[0].counts + 1 }, { hashtag_name: isHashtag.Records[0].hashtag_name })
//                 }
//             })
//         }


//         if (social_type == 'post') {

//             const post = await createSocial(
//                 filteredData
//             )
//             if (post) {
//                 const mediaPromises = req.files.map((file) => {
//                     const mediaData = {
//                         social_id: post.social_id,
//                         media_location: file.path, // Assuming `file.path` contains the uploaded file's location
//                     };

//                     // Call createMedia function for each file
//                     return createMedia(mediaData);
//                 });

//                 // Wait for all media entries to be created
//                 const mediaResults = await Promise.all(mediaPromises);
//                 const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
//                 if (mediaResults) {
//                     return generalResponse(
//                         res,
//                         {},
//                         "Post Uploaded Successfully",
//                         true,
//                         true
//                     )
//                 }
//                 return generalResponse(
//                     res,
//                     {},
//                     "Failed to Upload post",
//                     ture,
//                     true
//                 )
//             }
//             return generalResponse(
//                 res,
//                 {},
//                 "Failed to Upload post",
//                 ture,
//                 true
//             )
//         }
//         else if (social_type == 'reel') {
//             filteredData.reel_thumbnail = post_media
//             const reel = await createSocial(
//                 filteredData
//             )
//             if (reel) {

//                 const media = createMedia(
//                     {
//                         social_id: reel.social_id,
//                         media_location: media_location
//                     }
//                 )
//                 if (media) {


//                     const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
//                     if (reel.music_id) {
//                         const get_music = await getMusic({
//                             music_id: reel.music_id
//                         })
//                         if (get_music.Pagination.total_records > 0) {
//                             const update_music = updateMusic(
//                                 {
//                                     total_use: get_music.Records[0].total_use + 1
//                                 }
//                             )
//                         }

//                     }
//                     return generalResponse(
//                         res,
//                         {},
//                         "Reel Uploaded Successfully",
//                         true,
//                         true
//                     )
//                 }
//                 return generalResponse(
//                     res,
//                     {},
//                     "Failed to Upload post",
//                     ture,
//                     true
//                 )
//             }
//             return generalResponse(
//                 res,
//                 {},
//                 "Failed to Upload post",
//                 ture,
//                 true
//             )
//         }
//         return generalResponse(
//             res,
//             "Failed to Upload",
//             false,
//             true,

//         );

//     } catch (error) {
//         console.error("Error in uploading social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while uploading social!",
//             false,
//             true
//         );
//     }
// }
// async function uploadMediaS3(req, res) {
//     try {
//         const file = req.body
//         if (!file.originalname && !file.mimetype) {
//             return generalResponse(
//                 res,
//                 {},
//                 "File Data is missing",
//                 false,
//                 true,
//                 404
//             );
//         }
//         const url = await uploadFileToS3(file);
//         if (url) {
//             return generalResponse(
//                 res,
//                 { url: url },
//                 "File Uploaded Successfully",
//                 true,
//                 true
//             );
//         } else {
//             return generalResponse(
//                 res,
//                 {},
//                 "Failed to Upload File",
//                 false,
//                 true
//             );
//         }


//     } catch (error) {
//         console.error("Error in uploading file in s3", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while uploading file in s3!",
//             false,
//             true
//         );
//     }
// }

// async function showSocials(req, res) {
//     try {
//         const user_id = req.authData.user_id
//         const { page = 1, pageSize = 10, order = [
//             ['createdAt', 'DESC'],
//         ] } = req.body

//         let allowedUpdateFieldsMandatory = [];
//         let allowedUpdateFields = [];

//         allowedUpdateFields = ['social_id', 'social_type', 'country', 'location', 'taged', 'user_id', 'hashtag', 'music_id']
//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
//             filteredData.status = true
//             filteredData.deleted_by_user = false
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }
//         if (await getUser({ user_id })) {
//             let excludedUserIds = []
//             const uniqueIds = new Set();

//             const block1 = await getblock({ user_id: user_id })
//             const block2 = await getblock({ blocked_id: user_id })
//             if (block1?.Records?.length > 0 || block1?.Records?.length > 0) {
//                 block1?.Records?.forEach(blocks => {
//                     uniqueIds.add(blocks?.dataValues?.blocked_id);
//                 });
//                 block2?.Records?.forEach(blocks => {
//                     uniqueIds.add(blocks?.dataValues?.user_id);
//                 });

//                 excludedUserIds = Array.from(uniqueIds);

//             }

//             status = true
//             let socials
//             if (order == "random") {

//                 socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, Sequelize.literal('RANDOM()'));
//             }
//             else {
//                 socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, order);

//             }

//             // Filter out blocked users
//             if (socials?.Records?.length <= 0) {
//                 return generalResponse(
//                     res,
//                     {
//                         Records: [],
//                         Pagination: {}
//                     },
//                     "Socials not found",
//                     true,
//                     true,
//                     // 400
//                 );
//             }


//             // Now, you can safely iterate over the records and add the `isLiked` property
//             const likes = await getLike({ like_by: user_id });
//             const likedSocialIds = new Set(likes.Records.map((like) => like.social_id));
//             const saves = await getSave({ save_by: user_id });
//             const savedSocialIds = new Set(saves.Records.map((save) => save.social_id));

//             // Add an `isLiked` property to each social record
//             socials.Records = await Promise.all(socials.Records.map(async (social) => {
//                 // Convert each social object to a plain JSON object
//                 const socialJson = JSON.parse(JSON.stringify(social));

//                 // Fetch comments and likes asynchronously
//                 const comments = await getComment({ social_id: socialJson.social_id });
//                 const likes = await getLike({ social_id: socialJson.social_id });
//                 const saves = await getSave({ social_id: socialJson.social_id });
//                 const isFollowing = await isFollow({ follower_id: user_id, user_id: socialJson.user_id })
//                 // Add the isLiked, total_comments, and total_likes properties
//                 socialJson.isLiked = likedSocialIds.has(socialJson.social_id);
//                 socialJson.isSaved = savedSocialIds.has(socialJson.social_id);
//                 socialJson.total_comments = comments.Pagination.total_records;
//                 socialJson.total_likes = likes.Pagination.total_records;
//                 socialJson.total_saves = saves.Pagination.total_records;
//                 socialJson.isFollowing = false;
//                 if (isFollowing) {
//                     socialJson.isFollowing = true;
//                 }
//                 // Add the isLiked, total_comments, and total_likes properties


//                 return socialJson;
//             }));

//             return generalResponse(
//                 res,
//                 {
//                     Records: socials.Records,
//                     Pagination: socials.Pagination
//                 },
//                 "Socials Found",
//                 true,
//                 false
//             );
//         } else {
//             return generalResponse(
//                 res,
//                 {},
//                 "User not found",
//                 false,
//                 true,
//                 404
//             );
//         }

//     } catch (error) {
//         console.error("Error in finding social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while finding social!",
//             false,
//             true
//         );
//     }
// }
// async function getSocialsOfFollowers(req, res) {
//     try {
//         const user_id = req.authData.user_id;
//         const { page = 1, pageSize = 10 } = req.body;

//         const result = await getFollowerSocials(user_id, { page, pageSize });

//         if (!result.Records.length) {
//             return generalResponse(
//                 res,
//                 { Records: [], Pagination: {} },
//                 "No reels found from followed users",
//                 true,
//                 true
//             );
//         }

//         // Preload likes and saves made by current user
//         const [userLikes, userSaves] = await Promise.all([
//             getLike({ like_by: user_id }),
//             getSave({ save_by: user_id }),
//         ]);

//         const likedSocialIds = new Set(userLikes?.Records?.map(like => like.social_id));
//         const savedSocialIds = new Set(userSaves?.Records?.map(save => save.social_id));

//         // Enrich each social with isLiked, isSaved, total_comments, total_likes, total_saves, isFollowing
//         const enrichedRecords = await Promise.all(result.Records.map(async (social) => {
//             const socialJson = JSON.parse(JSON.stringify(social)); // make plain object

//             const [comments, likes, saves] = await Promise.all([
//                 getComment({ social_id: socialJson.social_id }),
//                 getLike({ social_id: socialJson.social_id }),
//                 getSave({ social_id: socialJson.social_id })
//             ]);

//             socialJson.isLiked = likedSocialIds.has(socialJson.social_id);
//             socialJson.isSaved = savedSocialIds.has(socialJson.social_id);
//             socialJson.total_comments = comments?.Pagination?.total_records || 0;
//             socialJson.total_likes = likes?.Pagination?.total_records || 0;
//             socialJson.total_saves = saves?.Pagination?.total_records || 0;
//             socialJson.isFollowing = true; // by default, as this is from followed users

//             return socialJson;
//         }));

//         return generalResponse(
//             res,
//             {
//                 Records: enrichedRecords,
//                 Pagination: result.Pagination
//             },
//             "Reels from followed users fetched successfully",
//             true,
//             false
//         );

//     } catch (err) {
//         console.error("Error in getFollowerSocials:", err);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong",
//             false,
//             true
//         );
//     }
// }


// async function showSocialswithoutauth(req, res) {
//     try {
//         // const user_id = req.authData.user_id
//         const { page = 1, pageSize = 10, order = [
//             ['createdAt', 'DESC'],
//         ] } = req.body

//         let allowedUpdateFieldsMandatory = [];
//         let allowedUpdateFields = [];

//         allowedUpdateFields = ['social_id', 'social_type', 'country', 'location', 'taged', 'user_id', 'hashtag', 'music_id']
//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
//             filteredData.status = true
//             filteredData.deleted_by_user = false
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }
//         let excludedUserIds = []

//         status = true
//         let socials
//         if (order == "random") {

//             socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, Sequelize.literal('RANDOM()'));
//         }
//         else {
//             socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, order);

//         }

//         // Filter out blocked users
//         if (socials?.Records?.length <= 0) {
//             return generalResponse(
//                 res,
//                 {
//                     Records: [],
//                     Pagination: {}
//                 },
//                 "Socials not found",
//                 true,
//                 true,
//                 // 400
//             );
//         }


//         // Now, you can safely iterate over the records and add the `isLiked` property


//         // Add an `isLiked` property to each social record
//         socials.Records = await Promise.all(socials.Records.map(async (social) => {
//             // Convert each social object to a plain JSON object
//             const socialJson = JSON.parse(JSON.stringify(social));

//             // Fetch comments and likes asynchronously
//             const comments = await getComment({ social_id: socialJson.social_id });
//             const likes = await getLike({ social_id: socialJson.social_id });
//             const saves = await getSave({ social_id: socialJson.social_id });
//             // const isFollowing = await isFollow({ follower_id: user_id, user_id: socialJson.user_id })
//             // Add the isLiked, total_comments, and total_likes properties

//             socialJson.total_comments = comments.Pagination.total_records;
//             socialJson.total_likes = likes.Pagination.total_records;
//             socialJson.total_saves = saves.Pagination.total_records;
//             socialJson.isFollowing = false;

//             // Add the isLiked, total_comments, and total_likes properties


//             return socialJson;
//         }));

//         return generalResponse(
//             res,
//             {
//                 Records: socials.Records,
//                 Pagination: socials.Pagination
//             },
//             "Socials Found",
//             true,
//             false
//         );


//     } catch (error) {
//         console.error("Error in finding social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while finding social!",
//             false,
//             true
//         );
//     }
// }

// async function showSocialsAdmin(req, res) {
//     try {
//         const admin_id = req.authData.admin_id
//         const { page = 1, pageSize = 10 } = req.body
//         const { sort_by = "createdAt", sort_order = "DESC" } = req.body
//         let allowedUpdateFieldsMandatory = [];
//         let allowedUpdateFields = [];
//         let allowedUpdateFieldsFilter = [];

//         allowedUpdateFields = ['social_id', 'social_type', 'country', 'location', 'taged', 'user_id', 'status', 'user_name']

//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }



//         const socials = await getSocial(
//             filteredData,
//             { page, pageSize },
//             [],
//             [[sort_by, sort_order]]
//         );

//         // Filter out blocked users
//         if (socials?.Records?.length <= 0) {
//             return generalResponse(
//                 res,
//                 {
//                     Records: [],
//                     Pagination: {}
//                 },
//                 "Socials not found",
//                 true,
//                 true,
//                 // 400
//             );
//         }


//         // Now, you can safely iterate over the records and add the `isLiked` property
//         // const likes = await getLike({ like_by: user_id });
//         // const likedSocialIds = new Set(likes.Records.map((like) => like.social_id));
//         // const saves = await getSave({ save_by: user_id });
//         // const savedSocialIds = new Set(saves.Records.map((save) => save.social_id));

//         // Add an `isLiked` property to each social record
//         socials.Records = await Promise.all(socials.Records.map(async (social) => {
//             // Convert each social object to a plain JSON object
//             const socialJson = JSON.parse(JSON.stringify(social));

//             // Fetch comments and likes asynchronously
//             const comments = await getComment({ social_id: socialJson.social_id });
//             const likes = await getLike({ social_id: socialJson.social_id });
//             const saves = await getSave({ social_id: socialJson.social_id });
//             // const isFollowing = await isFollow({ follower_id: user_id, user_id: socialJson.user_id })
//             // Add the isLiked, total_comments, and total_likes properties
//             // socialJson.isLiked = likedSocialIds.has(socialJson.social_id);
//             // socialJson.isSaved= savedSocialIds.has(socialJson.social_id);
//             socialJson.total_comments = comments.Pagination.total_records;
//             socialJson.total_likes = likes.Pagination.total_records;
//             socialJson.total_saves = saves.Pagination.total_records;

//             // Add the isLiked, total_comments, and total_likes properties


//             return socialJson;
//         }));

//         return generalResponse(
//             res,
//             {
//                 Records: socials.Records,
//                 Pagination: socials.Pagination
//             },
//             "Socials Found",
//             true,
//             false
//         );


//     } catch (error) {
//         console.error("Error in finding social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while finding social!",
//             false,
//             true
//         );
//     }
// }
// async function updateSocialsAdmin(req, res) {
//     try {
//         let allowedUpdateFields = [];


//         allowedUpdateFields = ['social_id', 'status']

//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 err.message,
//                 false,
//                 true
//             );
//         }



//         const socials = await getSocial(
//             { social_id: filteredData.social_id },
//         );

//         // Filter out blocked users
//         if (socials?.Records?.length <= 0) {
//             return generalResponse(
//                 res,
//                 {
//                     Records: [],
//                     Pagination: {}
//                 },
//                 "Socials not found",
//                 true,
//                 true,
//                 // 400
//             );
//         }
//         const updatedSocial = await updateSocial({ social_id: filteredData.social_id }, { status: filteredData.status })
//         const updatedsocials = await getSocial(
//             { social_id: filteredData.social_id },
//         );


//         return generalResponse(
//             res,
//             updatedsocials,
//             "Socials Found",
//             true,
//             false
//         );


//     } catch (error) {
//         console.error("Error in updating social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while updating social!",
//             false,
//             true
//         );
//     }
// }
// async function addViews(req, res) {
//     try {
//         const user_id = req.authData.user_id

//         let allowedUpdateFields = [];

//         allowedUpdateFields = ['social_ids']
//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }
//         if (filteredData.social_ids.length <= 0) {
//             return generalResponse(
//                 res,
//                 {},
//                 "Social Ids are missing",
//                 false,
//                 true,
//                 404
//             );
//         }
//         if (await getUser({ user_id })) {
//             for (let i = 0; i < filteredData.social_ids.length; i++) {
//                 const social = await getSocial({ social_id: filteredData.social_ids[i] });
//                 if (social.Records.length > 0) { // Check if a record exists
//                     social.Records[0].total_views = social.Records[0].total_views + 1; // Increment views


//                     await updateSocial({ social_id: filteredData.social_ids[i] }, { total_views: social.Records[0].dataValues.total_views }); // Pass only the updated record
//                 }
//             }

//             // Send response after processing all social IDs
//             return generalResponse(
//                 res,
//                 {},
//                 "Views Added Successfully",
//                 true,
//                 false
//             );




//         } else {
//             return generalResponse(
//                 res,
//                 {},
//                 "User not found",
//                 false,
//                 true,
//                 404
//             );
//         }

//     } catch (error) {
//         console.error("Error in adding Views", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while adding views!",
//             false,
//             true
//         );
//     }
// }

// async function deleteSocials(req, res) {
//     try {
//         const user_id = req.authData.user_id
//         if (process.env.ISDEMO == "true") {
//             console.log("running", req.userData.user_name);
            
//             let demo_user_names = [
//                 "williams654",
//                 "james55",
//                 "george43",
//                 "thomas1871",
//                 "martha34",
//                 "jane00",
//                 "johnbrook",
//                 "kevintemp",
//                 "kanika",
//                 "Jessicalauren",
//                 "SmithMurphy",
//                 "ameliamarg",
//                 "fitfoodie",
//                 "fabos_demo",
//                 "tonnygreg",

//             ]
//             if (demo_user_names.includes(req.userData.user_name)) {
//                 return generalResponse(
//                     res,
//                     {},
//                     "You are not allowed to edit as it is the property of demo user",
//                     false,
//                     true,
//                     // 403
//                 )
//             }
//         }
//         const { page = 1, pageSize = 10 } = req.body

//         let allowedUpdateFields = [];

//         allowedUpdateFields = ['social_id']
//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }
//         const isUser = await getUser({ user_id })
//         if (isUser) {

//             const socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds = []);

//             // Filter out blocked users
//             if (socials?.Records?.length <= 0) {
//                 return generalResponse(
//                     res,
//                     {
//                         Records: [],
//                         Pagination: {}
//                     },
//                     "Socials not found",
//                     true,
//                     true,
//                     // 400
//                 );
//             }


//             // const deletedSocials = await deleteSocial(filteredData)
//             const updatedSocial = await updateSocial({ social_id: filteredData.social_id, user_id: user_id }, { deleted_by_user: true })
//             const deletedNotification = await deleteNotification({
//                 social_id: filteredData.social_id
//             })
//             const updated_user = await updateUser({ total_socials: isUser.total_socials - 1 }, { user_id: user_id },)

//             if (updatedSocial) {
//                 return generalResponse(
//                     res,
//                     {

//                     },
//                     "Social delted Successfully",
//                     true,
//                     true
//                 );
//             }

//             return generalResponse(
//                 res,
//                 {},
//                 "Social not deleted ",
//                 false,
//                 false
//             );
//         } else {
//             return generalResponse(
//                 res,
//                 {},
//                 "User not found",
//                 false,
//                 true,
//                 404
//             );
//         }

//     } catch (error) {
//         console.error("Error in Deleting social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while Deleting social!",
//             false,
//             true
//         );
//     }
// }


// async function editSocial(req, res) {
//     try {
//         const social_type = req.body.social_type
//         const user_id = req.authData.user_id
//         if (process.env.ISDEMO == "true") {
//             console.log("running", req.userData.user_name);

//             let demo_user_names = [
//                 "williams654",
//                 "james55",
//                 "george43",
//                 "thomas1871",
//                 "martha34",
//                 "jane00",
//                 "johnbrook",
//                 "kevintemp",
//                 "kanika",
//                 "Jessicalauren",
//                 "SmithMurphy",
//                 "ameliamarg",
//                 "fitfoodie",
//                 "fabos_demo",
//                 "tonnygreg",

//             ]
//             if (demo_user_names.includes(req.userData.user_name)) {
//                 return generalResponse(
//                     res,
//                     {},
//                     "You are not allowed to edit as it is the property of demo user",
//                     false,
//                     true,
//                     // 403
//                 )
//             }
//         }
        
//         if (!req.body.social_id) {
//             return generalResponse(
//                 res,
//                 {},
//                 "social_id is required",
//                 false,
//                 402
//             )
//         }
//         let allowedUpdateFieldsMandatory = [];
//         let allowedUpdateFields = [];
//         let post_media
//         // if (process.env.MEDIAFLOW == "S3") {
//         //     if (!req.body.file_media_1) {
//         //         return generalResponse(
//         //             res,
//         //             {},
//         //             "File Data is missing",
//         //             false,
//         //             true,
//         //             404
//         //         );
//         //     }

//         //     post_media = req.body.file_media_1
//         // }
//         // else {

//         //     post_media = req.files[0].path
//         // }
//         // let media_location
//         // if (social_type == "reel") {
//         //     if (process.env.MEDIAFLOW == "S3") {
//         //         if (!req.body.file_media_2) {
//         //             return generalResponse(
//         //                 res,
//         //                 {},
//         //                 "File Data is missing",
//         //                 false,
//         //                 true,
//         //                 404
//         //             );
//         //         }

//         //         media_location = req.body.file_media_2
//         //     }
//         //     else {
//         //         media_location = req.files[1].path

//         //     }
//         // }
//         allowedUpdateFieldsMandatory = ['social_desc', 'social_type', 'location', 'taged', 'files', 'aspect_ratio', 'video_hight', 'music_id']
//         let filteredData;
//         try {
//             filteredData = updateFieldsFilter(req.body, allowedUpdateFieldsMandatory);
//             filteredData.user_id = user_id
//         }
//         catch (err) {
//             console.log(err);
//             return generalResponse(
//                 res,
//                 { success: false },
//                 "Data is Missing",
//                 false,
//                 true
//             );
//         }
//         const isUser = await getUser(filteredData)

//         if (!isUser) {
//             // return generalResponse(
//             //     res, req.files[1].path

//             // )
//         }
//         filteredData.country = isUser.country
//         if (filteredData.social_desc) {
//             filteredData.hashtag = extractHashtags(filteredData.social_desc);
//         }
//         if (filteredData?.hashtag || filteredData?.hashtag?.length > 0) {
//             filteredData.hashtag.forEach(async (hashtag) => {
//                 const isHashtag = await getHashTags({ hashtag_name: hashtag })

//                 if (isHashtag.Records.length <= 0) {
//                     await createHashtag({ hashtag_name: hashtag, counts: 1 })
//                 }
//                 else {

//                     await updateHashtag({ counts: isHashtag.Records[0].counts + 1 }, { hashtag_name: isHashtag.Records[0].hashtag_name })
//                 }
//             })
//         }


//         if (social_type == 'post') {

//             // const post = await createSocial(
//             //     filteredData
//             // )
//             const updated_post = await updateSocial({ social_id: req.body.social_id }, filteredData)
//             // if (post) {
//             //     const mediaPromises = req.files.map((file) => {
//             //         const mediaData = {
//             //             social_id: post.social_id,
//             //             media_location: file.path, // Assuming `file.path` contains the uploaded file's location
//             //         };

//             //         // Call createMedia function for each file
//             //         return createMedia(mediaData);
//             //     });

//             //     // Wait for all media entries to be created
//             //     const mediaResults = await Promise.all(mediaPromises);
//             //     const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
//             //     if (mediaResults) {
//             //         return generalResponse(
//             //             res,
//             //             {},
//             //             "Post Uploaded Successfully",
//             //             true,
//             //             true
//             //         )
//             //     }
//             //     return generalResponse(
//             //         res,
//             //         {},
//             //         "Failed to Upload post",
//             //         ture,
//             //         true
//             //     )
//             // }
//             return generalResponse(
//                 res,
//                 {},
//                 "Post updaated Successfully",
//                 true,
//                 true
//             )

//         }
//         else if (social_type == 'reel') {
//             const updated_post = await updateSocial({ social_id: req.body.social_id }, filteredData)
//             return generalResponse(
//                 res,
//                 {},
//                 "Reel updaated Successfully",
//                 true,
//                 true
//             )
//             // filteredData.reel_thumbnail = post_media
//             // const reel = await createSocial(
//             //     filteredData
//             // )
//             // if (reel) {

//             //     const media = createMedia(
//             //         {
//             //             social_id: reel.social_id,
//             //             media_location: media_location
//             //         }
//             //     )
//             //     if (media) {


//             //         const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
//             //         if (reel.music_id) {
//             //             const get_music = await getMusic({
//             //                 music_id: reel.music_id
//             //             })
//             //             if (get_music.Pagination.total_records > 0) {
//             //                 const update_music = updateMusic(
//             //                     {
//             //                         total_use: get_music.Records[0].total_use + 1
//             //                     }
//             //                 )
//             //             }

//             //         }
//             //         return generalResponse(
//             //             res,
//             //             {},
//             //             "Reel Uploaded Successfully",
//             //             true,
//             //             true
//             //         )
//             //     }
//             //     return generalResponse(
//             //         res,
//             //         {},
//             //         "Failed to Upload post",
//             //         ture,
//             //         true
//             //     )
//             // }
//             // return generalResponse(
//             //     res,
//             //     {},
//             //     "Failed to Upload post",
//             //     ture,
//             //     true
//             // )
//         }
//         return generalResponse(
//             res,
//             "Failed to Upload",
//             false,
//             true,

//         );

//     } catch (error) {
//         console.error("Error in updating social", error);
//         return generalResponse(
//             res,
//             { success: false },
//             "Something went wrong while updating social!",
//             false,
//             true
//         );
//     }
// }

// module.exports = {
//     uploadSocial,
//     showSocials,
//     deleteSocials,
//     addViews,
//     showSocialsAdmin,
//     updateSocialsAdmin,
//     uploadMediaS3,
//     editSocial,
//     showSocialswithoutauth,
//     getSocialsOfFollowers
// };      