const bcrypt = require('bcryptjs');

async function hashPasswords() {
  const passwords = ['admin', 'teacher', 'student'];
  
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`${password}: ${hash}`);
  }
}

hashPasswords();
