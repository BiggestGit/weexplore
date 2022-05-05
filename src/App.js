import logo from './logo.svg';
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap } from 'react-leaflet/hooks'
import { Map, MapContainer, Marker,Popup, useMapEvents } from 'react-leaflet'
import styled from 'styled-components';
import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('./graphics/big-flame.png'),
  iconUrl: require('./graphics/big-flame.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

const StyledMap = styled(MapContainer)`
    width: 100%;
    height: 100vh;
    position:absolute;
    top:0px;
    left:0px;
`;

const LocationFinderDummy = ({ setCurrentLocation }) => {
  const map = useMapEvents({
      click(e) {
          setCurrentLocation(e.latlng);
      },
  });
  return null;
};


// TODO set user header?

const client = axios.create({
  baseURL: 'http://localhost:3000'
})

const submitLocation = async (description, url, lat, lon) => {
  const payload = {
    id: (Math.random() * 1000).toString(),description, imageUrl: url, location: { lat, lon }
  };
  return client.post('/flags', payload);
}

const voteLocation = async (locationId) => {
  console.log('voting', locationId);
  return client.post(`/flags/${locationId}/vote`);
}

const LocationForm = ({ location, setChanged}) => {
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      submitLocation(desc, url, location.lat, location.lng)
        .then(() => setChanged(true));
    }}>
      <div>
      <div>Description</div>
      <input id="desc" type="text" name="description" value={desc} onChange={e => {
        e.preventDefault(); setDesc(e.target.value)}
        }/>
      </div>
      <div>
      <div>Image Url</div>
      <input id="imgurl" type="text" name="imgurl" value={url} onChange={e => {
        e.preventDefault(); setUrl(e.target.value)}
        }/>
      </div>

      <br />
      <div>
      <input type="submit" value="submit" />
      </div>
    </form>
  )
}

const LocationMarker = ({ location, nearestFlag, setChanged }) => {
  const [votes, setVotes] = useState(0);
  useEffect(() => {
    if (nearestFlag && nearestFlag.votes) {
      setVotes(nearestFlag.votes.length);
    }
  }, [nearestFlag])
  if (nearestFlag) {
    console.log(nearestFlag);
    return (
      <Popup position={[location.lat, location.lng]}>
        <div>{nearestFlag.description} +{votes}</div>
        <div>
        <img alt="" width="200" src={nearestFlag.imageUrl} />
        </div>
        <input type="button" value="vote" onClick={() => {
          voteLocation(nearestFlag.id)
            .then(() => setChanged(true));
        }} />
      </Popup>
    )
  } else {
    return (
      <Popup position={[location.lat, location.lng]}>
        <div>
        <h3>Add location</h3>
        <LocationForm location={location} setChanged={setChanged}/>
        </div>
      </Popup>
    )
  }
}

function App() {
  const [flags, setFlags] = useState([]);
  const [location, setLocation] = useState({ lat: 66.509936, lng: 25.725921});
  const [nearestFlag, setNearestFlag] = useState();
  const [changed, setChanged] = useState(true);

  useEffect(() => {
    if (changed) {
      client.get('/flags')
        .then((res) => setFlags(res.data))
      setChanged(false)
    }
  }, [changed])

  useEffect(() => {
    let nearest = null;
    let nearestDistance = Infinity;
    for (let flag of flags) {
      const dist = getDistanceFromLatLonInKm(flag.location.lat, flag.location.lon, location.lat, location.lng);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearest = flag;
      }
    }
    console.log(nearestDistance);
    if (nearestDistance > 0.25) {
      setNearestFlag(null);
      return;
    }
    setNearestFlag(nearest);
  }, [flags, location]);

  return (
      <StyledMap center={[66.509936, 25.725921]} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains='abcd'
        />
        {flags.map(m =>
          <Marker key={m.id} position={[m.location.lat, m.location.lon]}>
            icon.options.shadowSize = [0,0];
          </Marker>)}
        <LocationFinderDummy setCurrentLocation={setLocation}/>
        <LocationMarker nearestFlag={nearestFlag} location={location} setChanged={setChanged} />
    </StyledMap>
  );
}

export default App;
