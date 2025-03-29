/**
 * MarvelService.js - Общее описание:
 *
 * Этот модуль предоставляет набор функций для взаимодействия с Marvel API,
 * используя кастомный хук useHttp для выполнения HTTP-запросов.
 *
 * Основные возможности:
 * 1. Получение списка персонажей:
 *    - getAllCharacters: возвращает список персонажей с поддержкой пагинации.
 *    - getCharacterByName: осуществляет поиск персонажей по имени.
 *    - getCharacter: получает детальную информацию о конкретном персонаже по его ID.
 *
 * 2. Получение данных о комиксах:
 *    - getAllComics: возвращает список комиксов, упорядоченных по номеру выпуска.
 *    - getComic: получает детальную информацию о конкретном комиксе по его ID.
 *
 * 3. Преобразование данных:
 *    - _transformCharacter: преобразует данные персонажа в удобный формат для интерфейса.
 *    - _transformComics: преобразует данные комикса, обеспечивая удобочитаемость информации.
 *
 * Важные моменты:
 * - Используется базовый URL и API-ключ для доступа к Marvel API.
 * - Обработка ошибок и состояния запроса осуществляется через методы, возвращаемые хуком useHttp.
 * - API-ключ непосредственно прописан в коде, что не является лучшей практикой для продакшена.
 */

import { useHttp } from "../hooks/http.hook";

// Инициализируем Marvel сервис, который использует кастомный HTTP-хук
const useMarvelService = () => {
  const { request, clearError, process, setProcess } = useHttp();

  // Базовый URL для доступа к Marvel API
  const _apiBase = "https://gateway.marvel.com:443/v1/public/";

  // API-ключ для аутентификации запросов к Marvel API
  const _apiKey = "apikey=a38c01a10f2e6d5dfccc506500de6d1e";
  // Начальное смещение для пагинации списка персонажей
  const _baseOffset = 210;

  /**
   * Получает список персонажей с поддержкой пагинации.
   * @param {number} offset - смещение для пагинации, по умолчанию _baseOffset.
   */
  const getAllCharacters = async (offset = _baseOffset) => {
    const res = await request(
      `${_apiBase}characters?limit=9&offset=${offset}&${_apiKey}`
    );

    return res.data.results.map(_transformCharacter);
  };

  /**
   * Ищет персонажей по имени.
   * @param {string} name - имя персонажа для поиска.
   */
  const getCharacterByName = async (name) => {
    const res = await request(`${_apiBase}characters?name=${name}&${_apiKey}`);
    return res.data.results.map(_transformCharacter);
  };

  /**
   * Получает детальную информацию о персонаже по его ID.
   * @param {number} id - уникальный идентификатор персонажа.
   */
  const getCharacter = async (id) => {
    const res = await request(`${_apiBase}characters/${id}?${_apiKey}`);
    console.log(res);

    return _transformCharacter(res.data.results[0]);
  };

  /**
   * Получает список комиксов с сортировкой по номеру выпуска.
   * @param {number} offset - смещение для пагинации, по умолчанию 0.
   */
  const getAllComics = async (offset = 0) => {
    const res = await request(
      `${_apiBase}comics?orderBy=issueNumber&limit=8&offset=${offset}&${_apiKey}`
    );
    return res.data.results.map(_transformComics);
  };

  /**
   * Получает детальную информацию о комиксе по его ID.
   * @param {number} id - уникальный идентификатор комикса.
   */
  const getComic = async (id) => {
    const res = await request(`${_apiBase}comics/${id}?${_apiKey}`);
    return _transformComics(res.data.results[0]);
  };

  /**
   * Преобразует данные персонажа из API в удобный формат для использования в приложении.
   * @param {object} char - данные персонажа из Marvel API.
   */
  const _transformCharacter = (char) => {
    return {
      id: char.id,
      name: char.name,
      description: char.description
        ? `${char.description.slice(0, 210)}...`
        : "There is no description for this character",
      thumbnail: char.thumbnail.path + "." + char.thumbnail.extension,
      homepage: char.urls[0].url,
      wiki: char.urls[1].url,
      comics: char.comics.items,
    };
  };

  /**
   * Преобразует данные комикса из API в удобный для отображения формат.
   * @param {object} comics - данные комикса из Marvel API.
   */
  const _transformComics = (comics) => {
    return {
      id: comics.id,
      title: comics.title,
      description: comics.description || "There is no description",
      pageCount: comics.pageCount
        ? `${comics.pageCount} p.`
        : "No information about the number of pages",
      thumbnail: comics.thumbnail.path + "." + comics.thumbnail.extension,
      language: comics.textObjects[0]?.language || "en-us",
      price: comics.prices[0].price
        ? `${comics.prices[0].price}$`
        : "not available",
    };
  };

  // Возвращаем объект с доступными методами для использования в других частях приложения
  return {
    process,
    clearError,
    getAllCharacters,
    getCharacter,
    getAllComics,
    getComic,
    getCharacterByName,
    setProcess,
  };
};

export default useMarvelService;
