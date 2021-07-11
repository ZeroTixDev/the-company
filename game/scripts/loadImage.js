export default function loadImage(src) {
   const image = new Image();
   image.src = '../../images/' + src;
   return image;
}
