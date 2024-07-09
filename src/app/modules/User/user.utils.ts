
import { User } from './user.model';



// Faculty ID
export const findLastFacultyId = async () => {
  const lastFaculty = await User.findOne(
    {
      role: 'faculty',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastFaculty?.id ? lastFaculty.id.substring(2) : undefined;
};


// Admin ID
export const findLastAdminId = async () => {
  const lastAdmin = await User.findOne(
    {
      role: 'admin',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();


  return lastAdmin?.id ? lastAdmin.id.substring(2) : undefined;
};


// user id 
export const findLastUserId = async () => {
  const lastAdmin = await User.findOne(
    {
      role: 'user',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();


  return lastAdmin?.id ? lastAdmin.id.substring(2) : undefined;
};




export const generateAdminId = async () => {
  let currentId = (0).toString();
  const lastAdminId = await findLastAdminId();

  
  if (lastAdminId) {
    currentId = lastAdminId.substring(2);
  }
  
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `A-${incrementId}`;
  return incrementId;
};
export const generateUserId = async () => {
  let currentId = (0).toString();
  const lastAdminId = await findLastUserId();

  
  if (lastAdminId) {
    currentId = lastAdminId.substring(2);
  }
  
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `U-${incrementId}`;
  return incrementId;
};
