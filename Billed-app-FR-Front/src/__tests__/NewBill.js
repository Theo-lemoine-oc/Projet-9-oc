/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import mockStore from "../__mocks__/store"
jest.mock("../app/store", () => mockStore)
import {fireEvent} from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import {waitFor} from "@testing-library/dom"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then form new bill should be truthy", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const newBillObj = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })

    test("Then on click FileBtn fileChangeFunction should have been called", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillObj = new NewBill({
        document, onNavigate, store: mockStore, bills:bills, localStorage: window.localStorage
      })

      const fileChengeBtn = screen.getByTestId("file")
      expect(fileChengeBtn).toBeTruthy()
      const fileChengeFn = jest.fn((e) => newBillObj.handleChangeFile(e))
      fileChengeBtn.addEventListener('click', fileChengeFn)
      const fakeFile = new File(['(⌐□_□)'], 'image.jpg', { type: 'image/jpg' });
      userEvent.click(fileChengeBtn, {
        target: { files: [fakeFile] }
      });
      const numberOfFiles = screen.getByTestId("file").files.length
      expect(fileChengeFn).toHaveBeenCalled()
      expect(numberOfFiles).toEqual(1)

      const fakeFile2 = new File(['(⌐□_□)'], 'image.pdf', { type: 'application/pdf' });
      userEvent.click(fileChengeBtn, {
        target: { files: [fakeFile2] }
      });
      expect(document.querySelector(`input[data-testid="file"]`).value).toEqual("")
    })

    test("Then on click Submit handleSubmit should have been called", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillObj = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      console.log = jest.fn();
      const sendBillBtn = document.getElementById("btn-send-bill")
      const handleSubmit = jest.fn((e) => handleSubmit)
      sendBillBtn.addEventListener("click", handleSubmit)
      userEvent.click(sendBillBtn)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
    })
  })
})





// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill and submit", () => {
    test("then the new bill should be posted", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = BillsUI({ data: bills })
      const titrePage0 = await screen.getByText("Mes notes de frais")
      expect(titrePage0).toBeTruthy()
      const expenseNameValue0 = await screen.getAllByText("encore")
      expect(expenseNameValue0).toBeTruthy()
      
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillObj = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      await waitFor(() => screen.getByText('Envoyer une note de frais'))

      const create = jest.fn(mockStore.bills().create)
      const resCreate = await create()
      expect(create).toHaveBeenCalled()
      expect(resCreate.key).toBe('1234')
      const update = jest.fn(mockStore.bills().update)
      const resBillUpdate = await update()
      expect(update).toHaveBeenCalled()
      expect(resBillUpdate.id).toBe('47qAXb6fIm2zOKkLzMro')

      const spyHandleSubmit = jest.fn((e) => newBillObj.handleSubmit)
      const expenseName = screen.getByTestId("expense-name");
      expect(expenseName).toBeTruthy()
      const input = screen.getByTestId('expense-name')
      fireEvent.change(input, {target: { value: "My Expense Name" }})
      expect(input.value).toEqual("My Expense Name")

      const sendBill = document.getElementById("btn-send-bill")
      sendBill.addEventListener("click", spyHandleSubmit)
      userEvent.click(sendBill)
      expect(spyHandleSubmit).toHaveBeenCalled()
      
      const postSpy = jest.spyOn(mockStore, "post")
      const post = await mockStore.post()
      expect(postSpy).toHaveBeenCalled()
      expect(post.id).toEqual("123456789")

    });


  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})