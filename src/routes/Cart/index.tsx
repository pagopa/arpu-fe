import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import { openCartDrawer, closeCartDrawer } from 'store/CartStore';

/**
 * Empty page whose only job is to open the cart drawer when reached via its
 * dedicated URL (ROUTES.CART / ROUTES.public.CART). The drawer itself is
 * rendered by the Layout based on the `cart.isOpen` signal, so the page below
 * it is intentionally blank — it just fills the viewport so header and footer
 * stay anchored to the top and bottom edges.
 */
const Cart = () => {
  useEffect(() => {
    openCartDrawer();
    return () => closeCartDrawer();
  }, []);

  return <Box sx={{ minHeight: '100vh' }} />;
};

export default Cart;
