export const categories = ['All courses', 'Development', 'Backend', 'Full Stack'];
export const covers = ['cover-violet', 'cover-orange', 'cover-teal', 'cover-blue'];
export const initials = name => (name || 'Learner').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
export const idOf = item => item._id || item.id;
