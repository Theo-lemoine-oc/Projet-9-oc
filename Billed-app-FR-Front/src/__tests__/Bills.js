/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bill from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import {ROUTES} from "../constants/routes"
import mockStore from "../__mocks__/store.js"

jest.mock("../app/store", () => mockStore)
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy(); // create expect test
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Correction de : "if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)"
    // On passe alors à 58.62% de statements
    test("Then the 'nouvelle note de frais' button should fail to call handleClickNewBill if event not added", () => { 
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })}
      const bill = new Bill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })
      const nouvNoteBtn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(bill.handleClickNewBill) 
      userEvent.click(nouvNoteBtn) 
      expect(handleClickNewBill).not.toHaveBeenCalled()
    })
  })
})

// Correction de tout ce qui touche à l'icône
// On passe alors à 75.86% de statements
describe("Given I am connected as an employee", () => {
  describe('When I click on the eye icon of a bill', () => {
    test("Then an image should be displayed", async() => {
      const html = BillsUI({data: bills})
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({pathname}) }
      const bill = new Bill({ document, onNavigate, firestore: null, localStorage: window.localStorage })
      
      const iconEye = screen.getAllByTestId('icon-eye')[1]
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)
      const billUrl = iconEye.getAttributeNames('data-bill-url')
      userEvent.click(iconEye)

      const image = screen.findByAltText('bill-img')
      expect(image.src).not.toBeNull()
      expect(image.src).toBe(billUrl.value)
    })
  })
})


// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => {
        screen.getByText('Mes notes de frais')
      })
      const newBuildButton = await screen.getByText('Nouvelle note de frais')
      expect(newBuildButton).toBeTruthy()
    })
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
      window.onNavigate(ROUTES_PATH.Dashboard)
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

      window.onNavigate(ROUTES_PATH.Dashboard)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
  })
})