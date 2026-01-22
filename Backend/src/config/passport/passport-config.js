const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../app/models/User");

require("dotenv").config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = (profile.emails?.[0]?.value || "").toLowerCase();
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value || "";

        // 1) find by googleId
        let user = await User.findOne({ googleId });

        // 2) if not found, find by email (to avoid duplicate accounts)
        if (!user && email) {
          user = await User.findOne({ email });
        }

        // 3) create if not exists
        if (!user) {
          user = await User.create({
            email,
            googleId,
            avatarUrl,
            active: true,
            onboardingCompleted: false,
          });
        } else {
          // 4) update missing fields
          let changed = false;
          if (!user.googleId) {
            user.googleId = googleId;
            changed = true;
          }
          if (!user.avatarUrl && avatarUrl) {
            user.avatarUrl = avatarUrl;
            changed = true;
          }
          if (changed) await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, String(user._id));
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
