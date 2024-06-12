
import React, { useState, ChangeEvent, FC, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import debounce from 'lodash.debounce'; 
import './editpage.css'

interface Recipe {
  image: string | null;
  title: string;
  ingredients: string;
  instructions: string;
  preparationTime: number;
  favorite: boolean;
}

const Editpage: FC = () => {
  const [recipe, setRecipe] = useState<Recipe>({
    image: null,
    title: '',
    ingredients: '',
    instructions: '',
    preparationTime: 0,
    favorite: false,
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const recipesPerPage = 3;

  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipe({ ...recipe, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      setRecipe({ ...recipe, [name]: name === 'preparationTime' ? parseInt(value) : value });
    }
  };

  const handleSave = () => {
    if (
      recipe.image === null ||
      recipe.title.trim() === '' ||
      recipe.ingredients.trim() === '' ||
      recipe.instructions.trim() === '' ||
      recipe.preparationTime === 0
    ) {
      alert('Please fill all required fields.');
      return;
    }
  
    if (editIndex !== null) {
      const updatedRecipes = [...recipes];
      updatedRecipes[editIndex] = recipe;
      setRecipes(updatedRecipes);
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
      setEditIndex(null);
      setShowModal(false);
      alert('Recipe updated in local storage!');
    } else {
      const newRecipes = [...recipes, recipe];
      setRecipes(newRecipes);
      localStorage.setItem('recipes', JSON.stringify(newRecipes));
      alert('Recipe saved to local storage!');
    }
    setRecipe({
      image: null,
      title: '',
      ingredients: '',
      instructions: '',
      preparationTime: 0,
      favorite: false,
    });
  };
  
  const handleDelete = (index: number) => {
    const newRecipes = recipes.filter((_, i) => i !== index);
    localStorage.setItem('recipes', JSON.stringify(newRecipes));
    setRecipes(newRecipes);
    alert('Recipe deleted from local storage!');
  };

  const handleEdit = (index: number) => {
    setRecipe(recipes[index]);
    setEditIndex(index);
    setShowModal(true); 
  };

  const handleToggleFavorite = (index: number) => {
    const updatedRecipes = [...recipes];
    updatedRecipes[index].favorite = !updatedRecipes[index].favorite;
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = debounce((value: string) => {
    setSearch(value);
  }, 300); 

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.preparationTime - b.preparationTime;
    } else {
      return b.preparationTime - a.preparationTime;
    }
  });

  const filteredRecipes = sortedRecipes.filter(recipe => {
    const matchesFilter = !filter || (
      filter === 'lessThan30' ? recipe.preparationTime < 30 :
      filter === '30to60' ? recipe.preparationTime >= 30 && recipe.preparationTime <= 60 :
      filter === 'moreThan60' ? recipe.preparationTime > 60 : true
    );
    const matchesSearch = !search || recipe.title.toLowerCase().includes(search.toLowerCase()) || recipe.ingredients.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || recipe.favorite;
    return matchesFilter && matchesSearch && matchesFavorite;
  });

  const totalRecipes = filteredRecipes.length;
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalRecipes / recipesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="lessThan30">Less than 30 minutes</option>
        <option value="30to60">30 to 60 minutes</option>
        <option value="moreThan60">More than 60 minutes</option>
      </select>
     
      <input
        type="file"
        name="image"
        placeholder="Add Image"
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={recipe.title}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="ingredients"
        placeholder="Ingredients"
        value={recipe.ingredients}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="instructions"
        placeholder="Instructions"
        value={recipe.instructions}
        onChange={handleInputChange}
        required
      />
      <input
        type="number"
        name="preparationTime"
        placeholder="Preparation Time"
        value={recipe.preparationTime}
        onChange={handleInputChange}
        required
      />
      <button className="btn btn-primary btn-sm add" onClick={handleSave}>Add</button>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by title or ingredients"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <button 
          className="btn  btn-primary btn-sm addss" 
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
        </button>
      </div>

      <h2>Recipes</h2>
      <div className="row">
        {currentRecipes.map((rec, index) => (
          <div className="col-md-3" key={index}>
            <div className="card">
              {rec.image && <img src={rec.image} className="card-img-top" alt={rec.title} />}
              <div className="card-body">
                <h5 className="card-title">{rec.title}</h5>
                <p className="card-text"><strong>Ingredients:</strong> {rec.ingredients}</p>
                <p className="card-text"><strong>Instructions:</strong> {rec.instructions}</p>
                <p className="card-text"><strong>Preparation Time:</strong> {rec.preparationTime} minutes</p>
                <button className="btn btn-danger mr-2" onClick={() => handleDelete(index)}>Delete</button>
                <button className="btn btn-primary mr-2" onClick={() => handleEdit(index)}>Edit</button>
                <button className={`btn ${rec.favorite ? 'btn-success' : 'btn-outline-success'}`} onClick={() => handleToggleFavorite(index)}>
                  {rec.favorite ? 'Unfavorite' : 'Favorite'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {pageNumbers.map(number => (
          <button key={number} className='btn btn-primary btn-sm add' onClick={() => handlePageChange(number)}>{number}</button>
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
          className='mx-3'
            type="file"
            name="image"
            placeholder="Add Image"
            onChange={handleInputChange}
          />
          <input
           
            type="text"
            name="title"
            placeholder="Title"
            value={recipe.title}
            onChange={handleInputChange}
          />
          <input
            type="text"   name="ingredients"
            placeholder="Ingredients"
            value={recipe.ingredients}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="instructions"
             className='m-3'
            placeholder="Instructions"
            value={recipe.instructions}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="preparationTime"
            placeholder="Preparation Time"
            value={recipe.preparationTime}
            onChange={handleInputChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Update</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Editpage;

           
