import { ShoppingCart } from 'lucide-react';import {useNavigate} from 'react-router-dom';
export default function FloatingCart({count,total}){const nav=useNavigate();if(!count)return null;return <button className="floating-cart" onClick={()=>nav('/customer/cart')}><span><ShoppingCart size={18}/> {count} items</span><span>₹{total.toFixed(0)} →</span></button>}
