/**
 * @jest-environment jsdom
 */

 import '@testing-library/jest-dom'
import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI  from '../views/BillsUI.js'
import {localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES ,ROUTES_PATH} from '../constants/routes.js'
import Router from "../app/Router.js"
import mockStore from "../__mocks__/store.js"
jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Passage à 34.15% de statements
    test("Then mail icon in vertical layout should be highlighted",()=>{
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill'] } });
      document.body.innerHTML = `<div id="root"></div>`
      // launch router
      Router();
      // check if the icon is hightlighted
      expect(screen.getByTestId('icon-mail').classList.contains('active-icon')).toBeTruthy();
    })
    
    test("Then 'Envoyer une note de frais' displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })

    // Passage à 51.22% de statements
    test('Then, I submit form-new-bill, handleSubmit called',()=>{
      const html = NewBillUI()
      document.body.innerHTML = html
      let pathName =  ROUTES_PATH['NewBill']      
      const onNavigate = (pathName) => {
        document.body.innerHTML = ROUTES({ pathName })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      
      const newBill = new NewBill({document, onNavigate})
      expect(newBill).toBeDefined()
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
    })

    // Passage à 78.05% de statements
    test('Then, I click on Justificatif, handleChangeFile called',()=> {
      const html = NewBillUI()
      document.body.innerHTML = html  
      let pathName =  ROUTES_PATH['NewBill']   
      const onNavigate = (pathName) => {
        document.body.innerHTML = ROUTES({ pathName })
      }
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))    
      const newBill = new NewBill({document, onNavigate})
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileBtn = screen.getByTestId('file')
      expect(fileBtn).toBeDefined()
      fileBtn.addEventListener('click', handleChangeFile)
      fireEvent.click(fileBtn)
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})

// integration test POST
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API POST", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html  
      let pathName =  ROUTES_PATH['NewBill']   

      const onNavigate = (pathName) => {
        document.body.innerHTML = ROUTES({ pathName })
      }      
     const testBill = 
      {
        "id": "qcCK3SzECmaZAGRrHjaC",
        "status": "refused",
        "pct": 20,
        "amount": 200,
        "email": "a@a",
        "name": "test2",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-02",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }      
      
       const getSpy = jest.spyOn(mockStore, "post")     
       const bills = await mockStore.post(testBill) 
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.status).toBe(200)
       expect(bills.data.status).toBe("refused")
       expect(bills.data.id).toBe("qcCK3SzECmaZAGRrHjaC")
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.post.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.post.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})