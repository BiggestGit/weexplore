import logo from './logo.svg';
import { TileLayer } from 'react-leaflet/TileLayer'
import { useMap } from 'react-leaflet/hooks'
import { Map, MapContainer, Marker,Popup } from 'react-leaflet'
import styled from 'styled-components';

const StyledMap = styled(MapContainer)`
    width: 100%;
    height: 100vh;
    position:absolute;
    top:0px;
    left:0px;
`;

function App() {
  return (
      <StyledMap center={[66.509936, 25.725921]} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains='abcd'
        />
    </StyledMap>
  );
}

export default App;
