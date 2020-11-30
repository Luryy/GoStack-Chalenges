import React, {useState ,useEffect} from "react";

import "./styles.css";
import api from "./services/api";

function App() {

  const [repositorys, setRepositorys] = useState([]);

  useEffect(()=>{
    api.get('repositories')
      .then(response => {
        setRepositorys(response.data);
      })
  },[])
  
  async function handleAddRepository() {
    const addRepository = await api.post('repositories',{
        title: `Novo projeto ${Date.now()}`,
        url: 'https://github.com/Luryy/GoStack---ReactJs-Concepts',
        techs: 'ReactJs, JavaScript, WebPack'
      })
    
    setRepositorys([...repositorys, addRepository.data]);


  }

  async function handleRemoveRepository(id) {
    await api.delete('repositories/' + id);

    const repositorysKeep = repositorys.filter(repository => repository.id !== id);

    setRepositorys(repositorysKeep);
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositorys.map(repository => {
            return(
              <li key={repository.id}>
                {repository.title}

                <button onClick={() => handleRemoveRepository(repository.id)}>
                  Remover
                </button>
              </li>
            )})
        }
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
