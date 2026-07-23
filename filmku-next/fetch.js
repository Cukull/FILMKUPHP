fetch('http://localhost:3000/admin/film/edit/853db8f7-d9dc-4a52-b433-3d48848e302d').then(res => res.text()).then(text => {
  if (text.includes('Edit Film')) {
    console.log('SUCCESS: Edit Film page found');
  } else if (text.includes('This page could not be found')) {
    console.log('ERROR: 404 page returned');
  } else {
    console.log('UNKNOWN: ', text.substring(0, 200));
  }
}).catch(err => console.error(err));
