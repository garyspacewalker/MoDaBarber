
import { NextResponse } from 'next/server';

export async function GET() {
  const services = [
    { id:'cut-shave', name:'Cut & Shave', duration:90, price:250 },
    { id:'blade-chiskop', name:'Blade chiskop', duration:40, price:150 },
    { id:'clipper-chiskop', name:'Clipper Chiskop', duration:60, price:100 },
    { id:'cut-bleach', name:'Cut and bleach', duration:210, price:350 },
    { id:'cut-dye-app', name:'Cut and dye application', duration:150, price:300 },
    { id:'cut-dye-trim', name:'Cut and dye application "trim"', duration:120, price:250 },
    { id:'cut-color', name:'Cut and color', duration:120, price:300 },
    { id:'straight-hair', name:'Straight hair', duration:90, price:250 },
    { id:'beard-shave', name:'Beard shave', duration:30, price:50 },
    { id:'kids-cut', name:"Kid's cut", duration:45, price:150 }
  ];
  return NextResponse.json(services);
}
