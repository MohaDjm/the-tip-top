// frontend/src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    // OAuth Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // OAuth Facebook
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    
    // Authentification classique
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.token) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.firstName} ${data.user.lastName}`,
              token: data.token,
            };
          }
        } catch (error) {
          console.error('Erreur auth:', error);
        }

        return null;
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Première connexion
      if (account && user) {
        // Pour OAuth, créer ou récupérer l'utilisateur via l'API
        if (account.provider !== 'credentials') {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: user.email,
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ')[1] || '',
            }),
          });

          const data = await res.json();
          
          if (data.token) {
            token.accessToken = data.token;
            token.userId = data.user.id;
            token.role = data.user.role || 'CLIENT';
          }
        } else {
          // Pour credentials, on a déjà le token
          token.accessToken = user.token;
          token.userId = user.id;
          token.role = 'CLIENT';
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: token.userId,
          role: token.role,
        },
      };
    },
    
    async redirect({ url, baseUrl }) {
      // Rediriger vers le dashboard après connexion
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      return url;
    },
  },
  
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };