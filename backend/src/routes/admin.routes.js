const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { format, addDays } = require('date-fns');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Get user from token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Check user's role in our 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // If admin, add user to req object and continue
  req.user = user;
  next();
};

// --- API Routes ---

// --- Menu Management Routes ---

// GET /api/admin/menu/tomorrow
router.get('/menu/tomorrow', isAdmin, async (req, res) => {
  try {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('date', tomorrow)
      .order('meal_type');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/menu
router.post('/menu', isAdmin, async (req, res) => {
  try {
    const { date, meal_type, item_name, is_vegetarian } = req.body;

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        date,
        meal_type,
        item_name,
        is_vegetarian,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/menu/:id
router.delete('/menu/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- User Management Routes ---

// GET /api/admin/users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) { // <-- THIS WAS THE SYNTAX ERROR
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/promote
router.post('/promote', isAdmin, async (req, res) => {
  try {
    const { user_id } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;