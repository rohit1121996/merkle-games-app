import gameResolvers from './gameResolvers';
import companyResolvers from './companyResolvers';
import genreResolvers from './genreResolvers';
import reviewResolvers from './reviewResolvers';
import userResolvers from './userResolvers';
import imageResolvers from './imageResolvers';

const resolvers = {
  Query: {
    ...gameResolvers.Query,
    ...companyResolvers.Query,
    ...genreResolvers.Query,
    ...reviewResolvers.Query,
    ...userResolvers.Query,
    ...imageResolvers.Query
  },
  Game: gameResolvers.Game,
  Company: companyResolvers.Company,
  Genre: genreResolvers.Genre,
  Review: reviewResolvers.Review,
  User: userResolvers.User,
  Image: imageResolvers.Image,
  ImageRelation: imageResolvers.ImageRelation
};

export default resolvers;