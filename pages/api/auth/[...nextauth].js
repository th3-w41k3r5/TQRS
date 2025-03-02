import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/clientPromise";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,

  allowDangerousEmailAccountLinking: true,

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      let existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        console.log("🆕 New user detected:", user.email);
        const newUser = new User({
          name: user.name,
          email: user.email,
          provider: "google",
          credits: 100,
        });
        await newUser.save();
      } else {
        if (!existingUser.provider || existingUser.provider !== "google") {
          console.log("🔗 Fixing provider for:", user.email);
          existingUser.provider = "google";
          await existingUser.save();
        }
      }

      return true;
    },

    async session({ session }) {
      await dbConnect();
      const dbUser = await User.findOne({ email: session.user.email });

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.credits = dbUser.credits;
      }

      return session;
    },
  },
});
